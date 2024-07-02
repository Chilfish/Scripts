import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { defineCommand, runMain } from 'citty'
import { prompt } from '../utils/node'
import { buildUrl } from '../utils'

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
    merge: {
      type: 'string',
      description: '合并为双语字幕，需要提供另一个 srt 文件路径',
    },
  },
  run: async ({ args }) => {
    let { file, textOnly, merge } = args
    if (!file)
      file = await prompt('Enter the file path:')

    file = path.resolve(file)
    await main(file, textOnly, merge)
  },
}))

// Matches: 00:00:17,810 --> 00:00:20,330
const timeMatch = /\d+:\d+:\d+,\d+\s-->\s\d+:\d+:\d+,\d+/

// 翻译行数缓冲区大小
const chunkSize = 100
const translated: string[] = []

function chunkArray<T>(array: T[], size: number) {
  const result = [] as T[][]
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// from jp to zh
async function translator(text: string) {
  const api = buildUrl({
    uri: `https://translate.googleapis.com/translate_a/single`,
    query: {
      client: 'gtx',
      sl: 'ja',
      tl: 'zh-CN',
      dt: 't',
      q: text,
    },
  })

  const res = await fetch(api).then(res => res.json())

  return res[0].map(([translated]) => translated).join('') as string
}

async function translation(
  content: string,
  lines: string[],
) {
  const chunks = chunkArray(lines, chunkSize)

  for (const chunk of chunks) {
    await translator(chunk.join('\n'))
      .then(res => translated.push(...res.split('\n')))
  }

  // 将翻译插在原文之后
  let i = 0
  return content.replace(/.+/g, (line) => {
    if (!isText(line)) {
      return line
    }
    return `${line}\n${translated[i++] || ''}`
  })
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
) {
  return to.replace(/.+/g, (line) => {
    if (isText(line)) {
      return `${line}\n${from.shift()}` || ''
    }
    return line
  })
}

async function main(
  file: string,
  textOnly = false,
  merge?: string,
) {
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
    result = await translation(content, lines)
  }

  await writeFile(transed, result, 'utf-8')
  console.log(`Translating done!`)
}
