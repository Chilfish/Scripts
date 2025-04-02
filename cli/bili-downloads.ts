import { execSync } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dir, readJson } from '~/utils/nodejs'

const files = dir('F:/Backups/bili/data.json')
const folder = dir('F:/Videos/bili')
const maxDuration = 31 * 60 // 31 minutes

interface Data {
  title: string
  url: string
  duration: string
}

const urls = await readJson<Data[]>(files)
  .then(data => data.filter(({ duration }) => {
    // 12:34 -> 00:12:34
    if (duration.length <= 5)
      duration = `00:${duration}`

    const [h, m, s] = duration.split(':').map(Number)
    return h * 3600 + m * 60 + s <= maxDuration
  })
    .filter(({ url }) => url.includes('bilibili.com/video/BV')),
  )

for (const { url, title } of urls) {
  console.log(`Downloading ${title}...`)
  if (await stat(`${folder}/${title}.mp4`).catch(() => null))
    continue

  execSync(
    [
      'bbdown',
      '-aria2',
      '-mt',
      '-hs',
      '-e hevc',
      '-p 1',
      `-q "1080P 高码率, 1080P 高帧率"`,
      `-F="<ownerName> - <videoTitle>"`,
      `-M="<ownerName> - <videoTitle>/<pageNumber> - <pageTitle>"`,
      `--work-dir=${folder}`,
      url,
    ].join(' '),
    { stdio: 'inherit' },
  )
}
