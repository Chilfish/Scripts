import { execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dir } from '~/utils/nodejs'

const files = dir('C:/Users/Chilfish/Desktop/bili-list.txt')
const folder = dir('F:/Videos/bili/golang')

const urls = await readFile(files, { encoding: 'utf-8' }).then(lines =>
  lines.split('\n').filter(Boolean),
)

for (const url of urls) {
  try {
    execSync(
      [
        'bbdown',
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
  catch (e) {
    console.error(url, e)
  }
}
