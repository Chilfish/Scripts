import { createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { transMultiText } from './openai'

const data = await readFile('D:/Downloads/test.txt', 'utf-8')
const chunkLine = 1000

const chunks = data.split('\n').reduce<string[][]>((acc, line, index) => {
  if (index % chunkLine === 0) {
    acc.push([])
  }
  acc[acc.length - 1].push(line)
  return acc
}, [])

const writeStream = createWriteStream('data/output.yaml', {
  encoding: 'utf-8',
  flags: 'a',
})

const inputYamlStream = createWriteStream('data/input.yaml', {
  encoding: 'utf-8',
  flags: 'a',
})

let startAt = 0
for (const chunk of chunks) {
  const { textStream } = await transMultiText(
    chunk.join('\n'),
    startAt,
    async (yamlText) => {
      inputYamlStream.write(yamlText)
    },
  )
  startAt += chunkLine

  for await (const text of textStream) {
    writeStream.write(text)
  }
}

writeStream.close()
inputYamlStream.close()
