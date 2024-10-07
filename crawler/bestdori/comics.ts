import PQueue from 'p-queue'
import { downloadBlob } from '~/utils/download'
import { _fetch } from '.'

interface Comic {
  assetBundleName: string
  title: string[]
  subTitle: string[]
  publicStartAt: number[]
  characterId: number[]
}

const comicList = await _fetch<{
  [id: number]: Comic
}>('/comics/all.5.json')

if (!comicList) {
  console.error('Failed to fetch comicList')
  process.exit(1)
}

const pickupCharacters = [26, 27, 28, 29, 30, 36, 37, 38, 39, 40]

const comics = Object.entries(comicList).flatMap(([idx, comic]) => {
  const isPickup = comic.characterId.some(id => pickupCharacters.includes(id))
  if (!isPickup)
    return []

  const isSingleFrame = !comic.assetBundleName.includes('comic_fourframe_')
  const title = comic.title[0]

  const url = `https://bestdori.com/assets/jp/comic/${
    isSingleFrame ? 'comic_singleframe' : 'comic_fourframe'
  }/${comic.assetBundleName}_rip/${comic.assetBundleName}.png`

  return {
    name: `${title}.png`,
    url,
  }
})

console.log(comics.length)

const queue = new PQueue({ concurrency: 6 })

comics.forEach(({ name, url }) => {
  queue.add(async () => {
    await downloadBlob({ url, name, dest: 'D:/Downloads/bestdori/comics' })
  })
})

await queue.onIdle()

console.log('Downloaded all comics!')
