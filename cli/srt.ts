import { createWriteStream } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { config } from '~/utils/config'
import { dir } from '~/utils/file'
import { chunkArray } from '~/utils/math'
import { TransData, transMultiTextStream } from '~/utils/openai'

runMain(defineCommand({
  meta: {
    name: 'srt',
    description: '翻译/提取 srt 字幕文件',
  },
  args: {
    file: {
      type: 'string',
      description: '要翻译/提取的 srt 文件路径',
      required: true,
    },
    textOnly: {
      type: 'boolean',
      description: '仅提取字幕文本内容',
    },
    transOnly: {
      type: 'boolean',
      description: '将原字幕替换为翻译字幕',
    },
    cache: {
      type: 'boolean',
      description: '使用缓存翻译结果，而不请求 api',
    },
    merge: {
      type: 'string',
      description: '合并为双语字幕，需要提供另一个 srt 文件路径',
    },
    prompt: {
      type: 'string',
      description: '额外的 prompts，存储在 config.yaml 中',
    },
    startAt: {
      type: 'string',
      description: '翻译行数起始 id，用于继续翻译',
    },
  },
  run: async ({ args }) => {
    await main(args)
  },
}))

// Matches: 00:00:17,810 --> 00:00:20,330
const timeMatch = /\d+:\d+:\d+,\d+\s-->\s\d+:\d+:\d+,\d+/

// 翻译行数缓冲区大小，200 以下会减少一些缺段落的现象
// 大致的 Token 消耗：
// 800 -> 20138 input, 17247 output
// 600 -> 15000 input, 11200 output
// 200 -> 8000 input, 6800 output
// 100 -> 3566 input, 2602 output
const chunkSize = 100

const outputFile = dir('data/trans-output.yaml')
const tmpFile = dir('data/trans-tmp.yaml')

async function translate(
  chunks: string[][],
  promptKey?: string,
) {
  const prompt = promptKey ? config.prompts?.[promptKey] : undefined

  if (promptKey && !prompt) {
    console.warn(`Prompt ${promptKey} not found`)
  }
  else if (prompt) {
    console.log('Using prompt:', prompt)
  }

  const writeStream = createWriteStream(outputFile, {
    encoding: 'utf-8',
    flags: 'a',
  })
  const tmpStream = createWriteStream(tmpFile, {
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
      cb: async (yamlText) => {
        tmpStream.write(yamlText)
      },
    })

    for await (const text of textStream) {
      writeStream.write(text)
    }

    writeStream.write('\n')
    tmpStream.write('\n')
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

async function getTranslation(
  lines: string[],
  useCache = false,
  prompt?: string,
  startAt = 0,
): Promise<TransData[]> {
  const chunks = chunkArray(lines, chunkSize).slice(startAt)

  if (!useCache) {
    if (startAt === 0) {
      await writeFile(outputFile, '', 'utf-8')
      await writeFile(tmpFile, '', 'utf-8')
    }
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

/**
 *
 * @param from 仅字幕，无时间轴
 * @param to 带时间轴的字幕
 */
function mergeLines(
  from: string[],
  to: string,
  replace = false,
) {
  return to.replace(/.+/g, (line) => {
    if (isText(line)) {
      let text = `${line}\n${from.shift()}` || ''
      if (replace) {
        text = line.replace(/.+/g, () => from.shift() || '')
      }
      return text
    }
    return line
  })
}

interface MainArgs {
  file: string
  textOnly: boolean
  transOnly?: boolean
  cache?: boolean
  merge?: string
  prompt?: string
  startAt?: string
}

async function main({
  file,
  textOnly = false,
  transOnly = false,
  cache = false,
  startAt = '0',
  merge,
  prompt,
}: MainArgs) {
  let prefix = 'transed'
  if (textOnly)
    prefix = 'text'
  else if (merge)
    prefix = 'merged'

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
  else if (merge) {
    merge = path.resolve(merge)
    const mergeContent = await readFile(merge, 'utf-8')
    result = mergeLines(lines, mergeContent)
  }
  else {
    const data = await getTranslation(lines, cache, prompt, +startAt)

    // 将翻译插在原文之后
    let id = 1
    result = content.replace(/.+/g, (line) => {
      if (!isText(line)) {
        return line
      }

      const trans = data.find(d => d.id === id)?.text || `Blank ${id}`
      id++

      return transOnly ? trans : `${line}\n${trans}`
    })
  }

  await writeFile(transed, result, 'utf-8')
}
