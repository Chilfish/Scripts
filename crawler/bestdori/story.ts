import fs from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { downloadBlob, readJson, writeJson } from '~/utils/nodejs'
import { PQueue } from '~/utils/promise'
import {
  fetchExplorer,
  getAreas,
  getCharacters,
  getFileDir,
  getMapStories,
} from '.'

/**
 * 根据乐队获取所有角色的 地图剧情
 */
export async function getAreasStoryByBand(bandId: number) {
  let [areas, characters, stories] = await Promise.all([getAreas(), getCharacters(), getMapStories()])

  characters = characters.filter(character => character.bandId === bandId)

  const storyIds = stories
    .filter(story => story.characterIds.some(id =>
      characters.map(character => character.id).includes(id)),
    )
    .map(story => story.id)

  return stories
    .filter(story => storyIds.includes(story.id))
    .map(story => ({
      id: story.id,
      area: areas.find(area => area.id === story.areaId)!,
      characters: characters.filter(character => story.characterIds.includes(character.id)),
    }))
}

/**
 * 获取所有角色的卡面剧情
 * @type {角色名: [资源文件名]}
 */
export async function getStories(
  isFetch = true,
  dest = '"D:/Downloads/bestdori/story-assets.json"',
) {
  if (!isFetch && fs.existsSync(dest)) {
    return await readJson(dest)
  }

  const resourceset = await getFileDir()
    .then(infos => Object.keys(infos.characters.resourceset))

  const characters = await getCharacters()

  const queue = new PQueue({ concurrency: 16 })
  const charaData = new Map<string, string[]>()

  for (const key of resourceset) {
    queue.add(async () => {
    // res001 001
      const [_, chara] = key.match(/res(\d{3})(\d{3})/) || []
      if (!chara)
        return

      const data = await fetchExplorer<string[]>(`/characters/resourceset/${key}.json`)
      if (!data)
        return

      const assets = data
        .filter(file => file.endsWith('.asset'))
        .map(file => `${key}_rip/${file}`)

      const name = characters.find(c => c.id === Number.parseInt(chara))!.name

      if (!charaData.has(name))
        charaData.set(name, [])
      charaData.get(name)?.push(...assets)
    })
  }

  await queue.onIdle()

  const json = Object.fromEntries([...charaData.entries()])
  await writeJson(dest, json)

  return json
}

const baseUrl = 'https://bestdori.com/assets/jp'

/**
 * 卡面剧情，语音在 sound/voice/scenario/resourceset/{卡面id}
 */
export async function downStories() {
  const assets = await getStories() as Record<string, string[]>
  const pQueue = new PQueue({ concurrency: 10 })

  for (const [name, files] of Object.entries(assets)) {
    const dest = `D:/Downloads/bestdori/story/${name}`
    await mkdir(dest, { recursive: true })

    for (const asset of files) {
      pQueue.add(async () => {
        const url = `${baseUrl}/characters/resourceset/${asset}`
        const filename = asset.split('/').at(-1)!.replace('asset', 'json')

        await downloadBlob({
          url,
          name: filename,
          dest,
        })
      })
    }
  }

  await pQueue.onIdle()
  console.log('Downloaded all stories')
}

/**
 * 故事剧情，语音在 sound/voice/scenario/birthdaystory{id}
 */
export async function downBirthday() {
  const birthdays = await fetchExplorer<string[]>('/scenario/birthdaystory.json')
  if (!birthdays)
    return

  console.log(birthdays.length)

  const queue = new PQueue({ concurrency: 16 })
  for (const key of birthdays) {
    if (!key.endsWith('.asset'))
      continue

    queue.add(async () => {
      await downloadBlob({
        url: `${baseUrl}/scenario/birthdaystory_rip/${key}`,
        name: key.replace('asset', 'json'),
        dest: 'D:/Downloads/bestdori/birthday',
      })
    })
  }

  await queue.onIdle()
  console.log('Downloaded all birthday stories')
}

// await downloadStory()
await downBirthday()
