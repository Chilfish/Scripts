export interface Character {
  bandId: number
  id: number
  name: string
}

export interface Story {
  id: number
  areaId: number
  characterIds: number[]
}

export interface Area {
  id: number
  name: string
}

export async function _fetch<T = any>(
  path: string,
  base = 'https://bestdori.com/api',
) {
  const url = `${base}${path}`
  try {
    const res = await fetch(url)
    return await (res.json() as Promise<T>)
  }
  catch (e) {
    console.error(`Failed to fetch ${url}: ${e}`)
    return null
  }
}

export async function fetchExplorer<T = any>(
  path: string,
) {
  return await _fetch<T>(`/explorer/jp/assets${path}`)
}

export async function getCharacters() {
  return await _fetch('/characters/main.2.json')
    .then((data: any) => Object.entries(data)
      .map(([id, character]: [string, any]) => ({
        id: Number.parseInt(id),
        bandId: character.bandId,
        name: character.characterName[3].replace(' ', ''),
      })) as Character[],
    )
}

export async function getAreas() {
  return _fetch('/misc/areas.1.json')
    .then((data: any) => Object.entries(data)
      .map(([id, area]: [string, any]) => ({
        id: Number.parseInt(id),
        name: area.areaName[3], // cn
      })) as Area[],
    )
}

export async function getMapStories() {
  return _fetch('/misc/actionsets.5.json')
    .then((data: any) => Object.entries(data)
      .map(([id, story]: [string, any]) => ({
        id: Number.parseInt(id),
        areaId: story.areaId,
        characterIds: story.characterIds,
      })) as Story[],
    )
}

export async function getMapStoryAssets(storyId: number) {
  const baseUrl = 'https://bestdori.com/assets/cn'
  const actionsetUrl = `${baseUrl}/actionset/group${Math.floor(storyId / 128)}_rip/ActionSet${storyId}.asset`

  const actionset = await fetch(actionsetUrl).then(res => res.text())
  const reactionTypeBelongId = actionset.match(/"reactionTypeBelongId":"(\w+\d)"/)?.[1] ?? '0'

  const assest = `${baseUrl}/scenario/actionset/group${Math.floor(storyId / 256)}_rip/Scenario${reactionTypeBelongId}.asset`
  const voice = `${baseUrl}/sound/voice/scenario/actionset/actionset${10 * Math.floor(storyId / 200)}_rip/`

  return { assest, voice }
}

/**
 * 获取文件树列表
 */
export async function getFileDir() {
  return await _fetch('/explorer/jp/assets/_info.json')
}

export const explorerUrl = 'https://bestdori.com/tool/explorer/asset/jp'
