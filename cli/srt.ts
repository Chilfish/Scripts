import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

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
async function translate(text: string) {
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

function isText(line: string) {
  return line.trim() // empty lines
    && !timeMatch.test(line) // time lines
    && !/^\d+$/.test(line) // number lines
}

let file = process.argv[2]
if (!file) {
  throw new Error('No file provided')
}

file = path.resolve(file)
const transed = path.join(path.dirname(file), `transed-${path.basename(file)}`)

console.log(`Translating ${file} to ${transed}`)

const content = await readFile(file, 'utf-8')

const lines = content
  .split('\n')
  .filter(isText)

const chunks = chunkArray(lines, chunkSize)

for (const chunk of chunks) {
  await translate(chunk.join('\n'))
    .then(res => translated.push(...res.split('\n')))
}

// 将翻译插在原文之后
let i = 0
const result = content.replace(/.+/g, (line) => {
  if (!isText(line)) {
    return line
  }
  return `${line}\n${translated[i++] || ''}`
})

await writeFile(transed, result, 'utf-8')

console.log(`Translating done!`)
