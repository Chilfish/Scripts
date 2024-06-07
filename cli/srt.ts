import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { defineCommand, runMain } from 'citty'

// Matches: 00:00:17,810 --> 00:00:20,330
const timeMatch = /\d+:\d+:\d+,\d+\s-->\s\d+:\d+:\d+,\d+/

// 翻译行数缓冲区大小
const chunkSize = 100
const translated: string[] = []

function buildSearchParam(obj: Record<string, string>) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

function chunkArray<T>(array: T[], size: number) {
  const result = [] as T[][]
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// from jp to zh
async function translator(text: string) {
  const query = buildSearchParam({
    client: 'gtx',
    sl: 'ja',
    tl: 'zh-CN',
    dt: 't',
    q: text,
  })

  const api = `https://translate.googleapis.com/translate_a/single?${query}`
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

runMain(defineCommand({
  meta: {
    name: '',
    description: '',
  },
  args: {
    file: {
      type: 'string',
      description: 'The srts file to translate',
      required: true,
    },
    textOnly: {
      type: 'boolean',
      description: 'Only translate text',
    },
    merge: {
      type: 'string',
      description: 'Merge translated text to original file',
    },
  },
  run: async ({ args }) => {
    const { file, textOnly, merge } = args
    await main(file, textOnly, merge)
  },
}))

async function main(
  file: string,
  textOnly: boolean,
  merge: string,
) {
  file = path.resolve(file)
  const transed = path.join(path.dirname(file), `transed-${path.basename(file)}`)

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
