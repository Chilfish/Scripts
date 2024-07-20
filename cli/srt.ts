import { readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { defineCommand, runMain } from 'citty'
import { loadConfig } from 'c12'
import { dir, prompt } from '~/utils/node'
import { chunkArray } from '~/utils'
import { transMultiText } from '~/utils/openai'

runMain(defineCommand({
  meta: {
    name: 'srt',
    description: '翻译/提取 srt 字幕文件',
  },
  args: {
    file: {
      type: 'string',
      description: '要翻译/提取的 srt 文件路径',
    },
    textOnly: {
      type: 'boolean',
      description: '仅提取字幕文本内容',
    },
    transOnly: {
      type: 'boolean',
      description: '将原字幕替换为翻译字幕',
    },
    merge: {
      type: 'string',
      description: '合并为双语字幕，需要提供另一个 srt 文件路径',
    },
  },
  run: async ({ args }) => {
    let file = args.file
    if (!file)
      file = await prompt('Enter the file path:')

    file = path.resolve(file)
    await main(args)
  },
}))

// Matches: 00:00:17,810 --> 00:00:20,330
const timeMatch = /\d+:\d+:\d+,\d+\s-->\s\d+:\d+:\d+,\d+/

// 翻译行数缓冲区大小
const chunkSize = 800

async function getTranslation(
  lines: string[],
): Promise<string[]> {
  const chunks = chunkArray(lines, chunkSize)

  const file = dir('data/output.yaml')
  await writeFile(file, '', 'utf-8')

  const writeStream = createWriteStream(file, {
    encoding: 'utf-8',
    flags: 'a',
  })

  let startAt = 0
  for (const chunk of chunks) {
    const { textStream } = await transMultiText(chunk.join('\n'), startAt)
    for await (const text of textStream) {
      writeStream.write(text)
    }
    writeStream.write('\n')
    startAt += chunkSize
  }

  console.log('Translating done!')

  const config = await loadConfig<{
    id: number
    trans: string
  }[]>({
    configFile: file,
  })

  const data = config.layers?.[0].config || []

  console.log('input size:', lines.length, 'output size:', data.length)

  return data.map(({ trans }) => trans)
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
  merge?: string
}

async function main({
  file,
  textOnly = false,
  transOnly = false,
  merge,
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
    const data = await getTranslation(lines)

    // 将翻译插在原文之后
    let i = 0
    result = content.replace(/.+/g, (line) => {
      if (!isText(line)) {
        return line
      }
      const trans = data[i++] || ''

      return transOnly ? trans : `${line}\n${trans}`
    })
  }

  await writeFile(transed, result, 'utf-8')
}
