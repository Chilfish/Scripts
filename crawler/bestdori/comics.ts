import { downloadFiles } from '~/utils/nodejs'
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

const comics = Object.entries(comicList).flatMap(([_idx, comic]) => {
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

await downloadFiles(comics, {
  dest: 'F:/Downloads/bestdori/comics',
  concurrency: 6,
})

console.log('Downloaded all comics!')
