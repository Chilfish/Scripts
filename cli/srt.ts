import { createWriteStream } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { config } from '~/utils/config'
import { dir } from '~/utils/file'
import { chunkArray } from '~/utils/math'
import { toTransYaml, TransData, transMultiTextStream } from '~/utils/openai'

runMain(defineCommand({
  meta: {
    name: 'srt',
    description: '翻译/提取 srt 字幕文件',
  },
  args: {
    file: {
      type: 'positional',
      description: '要翻译/提取的 srt 文件路径',
    },
    textOnly: {
      type: 'boolean',
      description: '仅提取字幕文本内容',
      default: false,
    },
    transOnly: {
      type: 'boolean',
      description: '将原字幕替换为翻译字幕',
      default: true,
    },
    cache: {
      type: 'boolean',
      description: '使用缓存翻译结果，而不请求 api',
      default: false,
    },
    prompt: {
      type: 'string',
      description: '额外的 prompts，存储在 config.yaml 中',
      default: '',
    },
  },
  run: async ({ args }) => {
    await main(args)
  },
}))

// Matches: 00:00:17,810 --> 00:00:20,330
const timeMatch = /\d+:\d+:\d+,\d+\s-->\s\d+:\d+:\d+,\d+/

// 翻译行数缓冲区大小，200 以下会减少一些缺段落的现象
const chunkSize = 100

const outputFile = dir('data/trans-output.yaml')
const tmpFile = dir('data/trans-tmp.yaml')

async function translate(
  chunks: string[][],
  prompt: string,
) {
  const outputStream = createWriteStream(outputFile, {
    encoding: 'utf-8',
    flags: 'a',
  })
  let startAt = 0
  let lastLine = 0
  for (const chunk of chunks) {
    const { textStream } = await transMultiTextStream({
      text: chunk.join('\n'),
      startAt,
      additionalPrompt: prompt,
    })

    for await (const text of textStream) {
      outputStream.write(text)
    }

    outputStream.write('\n')
    startAt += chunkSize

    const translatedSize = await readTranslation().then(data => data.length)
    const diff = translatedSize - lastLine
    console.log(`Translated ${diff}/${chunk.length} lines`)
    lastLine = translatedSize
  }

  console.log('Translating done!')
}

async function readTranslation() {
  const config = await loadConfig<TransData[]>({ configFile: outputFile })
  return config.layers?.[0].config || []
}

async function translationTask(
  lines: string[],
  useCache = false,
  prompt: string,
): Promise<TransData[]> {
  const chunks = chunkArray(lines, chunkSize)

  if (!useCache) {
    const yamlText = toTransYaml(lines.join('\n'))
    await writeFile(tmpFile, yamlText, 'utf-8')
    await writeFile(outputFile, '', 'utf-8')
    await translate(chunks, prompt)
  }

  const data = await readTranslation()
  console.log('input size:', lines.length, 'output size:', data.length)
  return data
}

function isText(line: string) {
  return line.trim() // empty lines
    && !timeMatch.test(line) // time lines
    && !/^\d+$/.test(line) // number lines
}

interface MainArgs {
  file: string
  textOnly: boolean
  transOnly?: boolean
  cache?: boolean
  prompt?: string
  startAt?: string
}

async function main({
  file,
  textOnly = false,
  transOnly = true,
  cache = false,
  prompt,
}: MainArgs) {
  let prefix = 'transed'
  if (textOnly)
    prefix = 'text'

  const transed = path.join(path.dirname(file), `${prefix}-${path.basename(file)}`)

  console.log(`Translating ${file} to ${transed}`)

  const content = await readFile(file, 'utf-8')
  let result = ''

  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(isText)

  if (textOnly) {
    result = lines.join('\n')
  }
  else {
    prompt = (prompt ? config.prompts?.[prompt] : undefined) || prompt || ''

    console.log('Using prompt:', prompt)
    const data = await translationTask(lines, cache, prompt)

    // 将翻译插在原文之后
    let id = 1
    result = content.replace(/.+/g, (line) => {
      if (!isText(line)) {
        return line
      }

      const trans = data.find(d => d.id === id)?.text || line
      id++
      return transOnly ? trans : `${line}\n${trans}`
    })
  }

  await writeFile(transed, result, 'utf-8')
}
