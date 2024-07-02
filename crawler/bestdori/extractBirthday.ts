import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { readJson } from '../../utils/node'

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

  const dataString = talkData.map(({ name, text }) => `${name}: ${text}`).join('\n')

  const num = file.match(/(\d+)/)?.[0] || file
  await writeFile(`${textDir}/${num}.txt`, dataString)
}

const num = process.argv[2] || '1'
if (num === 'all') {
  const files = await readdir(dir)
  for (const file of files) {
    // Scenario\d.json
    if (file.endsWith('.json')) {
      await extract(file)
    }
  }
}
else {
  await extract(num)
}
