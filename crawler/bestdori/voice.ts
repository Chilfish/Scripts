import path from 'node:path'
import PQueue from 'p-queue'
import { fetchExplorer, getFileDir } from '.'
import { downloadBlob } from '~/utils/node'

const dest = 'D:/Downloads/bestdori/voice'
const baseUrl = 'https://bestdori.com/assets/jp/sound'

async function systemVoice() {
  const data = await fetchExplorer<string[]>(`/sound/voice/system.json`)
  if (!data)
    throw new Error('Failed to fetch voice data')

  const queue = new PQueue({ concurrency: 10 })

  for (const key of data) {
    queue.add(async () => {
      await downloadBlob({
        url: `${baseUrl}/voice/system_rip/${key}`,
        name: key,
        dest,
      })
    })
  }

  await queue.onIdle()

  console.log('Downloaded all voice data')
}

async function inGameCutIn() {
  const inGameCutInData = await getFileDir()
    .then(infos => Object.keys(infos.sound.ingamecutin))

  const queue = new PQueue({ concurrency: 10 })

  async function fetchMp3(key: string) {
    const data = await fetchExplorer<string[]>(`/sound/ingamecutin/${key}.json`)
    if (!data)
      throw new Error('Failed to fetch in-game cut-in data')

    for (const file of data) {
      if (!file.endsWith('.mp3'))
        continue

      queue.add(async () => {
        await downloadBlob({
          url: `${baseUrl}/ingamecutin/${key}_rip/${file}`,
          name: file,
          dest: `${dest}/${key}`,
        })
      })
    }
  }

  for (const key of inGameCutInData) {
    await fetchMp3(key)
  }

  await queue.onIdle()
  console.log('Downloaded all in-game cut-in data')
}

async function storyBgm() {
  const data = await getFileDir()
    .then(data => Object.keys(data.sound.scenario.bgm))

  const queue = new PQueue({ concurrency: 10 })

  for (const key of data) {
    queue.add(async () => {
      const name = await fetchExplorer<string[]>(`/sound/scenario/bgm/${key}.json`)
        .then(data => data?.find(file => file.endsWith('.mp3')))

      if (!name)
        return

      await downloadBlob({
        url: `${baseUrl}/scenario/bgm/${key}_rip/${name}`,
        name,
        dest: path.join(dest, '../bgm'),
        mime: 'audio',
      })
    })
  }
}

await storyBgm()
