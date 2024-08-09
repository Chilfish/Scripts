import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { readJson } from '~/utils/file'
import { transMultiText } from '~/utils/openai'
import { config } from '~/utils/config'

const dir = 'D:/Downloads/bestdori/birthday/'
const textDir = path.join(dir, 'text')

interface TalkData {
  name: string
  text: string
}

async function extract(file: string) {
  const data = await readJson(path.join(dir, file))

  const talkData = data.Base.talkData.map((talk: any) => ({
    name: talk.windowDisplayName,
    text: talk.body.replace(/\n/g, '、'),
  })) as TalkData[]

  const dataString = talkData.map(({ name, text }) => `${name}：${text}`).join('\n')

  const num = file.match(/(\d+)/)?.[0] || file
  await writeFile(`${textDir}/${num}.txt`, dataString)
  return dataString
}

const filename = process.argv[2] || '1'
if (filename === 'all') {
  const files = await readdir(dir)
  for (const file of files) {
    // Scenario\d.json
    if (file.endsWith('.json')) {
      await extract(file)
    }
  }

  process.exit(0)
}

const text = await extract(filename)
const transText = await transMultiText({
  text,
  additionalPrompt: config.prompts.bestdori,
})

await writeFile(
  path.join(textDir, `trans-${filename}.txt`),
  transText,
  'utf-8',
)
