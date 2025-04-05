import type { ArgsOptions, VideoProgress } from 'ytdlp-nodejs'
import { homedir } from 'node:os'
import path from 'node:path'
import { YtDlp } from 'ytdlp-nodejs'
import {
  fmtDuration,
  fmtFileSize,
} from '../utils/math'
import {
  argvParser,
  cachedData,
  downloadBlob,
  logger,
  updateProgress,
  which,
} from '../utils/nodejs'

const args = argvParser([{
  key: 'url',
  description: 'The URL of the video to download',
  type: 'string',
  required: true,
}, {
  key: 'path',
  description: 'The path to save the video',
  type: 'string',
  default: path.join(homedir(), 'Desktop'),
}, {
  key: 'audio',
  description: 'Download only the audio',
  type: 'boolean',
  default: false,
}, {
  key: 'cover',
  description: 'Download only the cover',
  type: 'boolean',
  default: false,
}] as const)

console.log(args)

const ytDlpPath = await which('yt-dlp')

const ytDlp = new YtDlp({
  binaryPath: ytDlpPath,
})

const url = new URL(args.url)

const videoId = url.searchParams.get('v')
  || url.pathname.split('/').filter(Boolean).pop()!

const cacheId = `${url.hostname}/${videoId}`

const videoInfo = await cachedData(`data/ytd/${cacheId}.json`, () => ytDlp.getInfoAsync(args.url))

const isTwitter = /(x|twitter)\.com/.test(args.url)
const isWeibo = /weibo\.com/.test(args.url)
const isTikTok = /tiktok\.com/.test(args.url)

const {
  uploader: author,
  title,
  upload_date: publishDate,
  duration,
} = videoInfo

let fileName = `${author} - ${title} - ${publishDate}`
if (isTwitter) {
  fileName = `${author} - ${publishDate}`
}

console.log({
  fileName,
  duration: fmtDuration(duration),
})

const cookiesPath = path.join(homedir(), 'cookies.txt')

const commonOptions: ArgsOptions & {
  onProgress: (progress: VideoProgress) => void
} = {
  paths: args.path,
  embedThumbnail: true,
  cookies: cookiesPath,
  onProgress,
}

if (args.cover) {
  const coverUrl = videoInfo.thumbnail
  await downloadBlob({
    url: coverUrl,
    dest: args.path,
    name: `${fileName}-cover.jpg`,
  })
  process.exit(0)
}

if (args.audio) {
  await ytDlp.downloadAsync(args.url, {
    ...commonOptions,
    output: `${fileName}-audio.aac`,
    format: {
      filter: 'audioonly',
      quality: 1,
      type: 'aac',
    },
  }).catch((error) => {
    logger.error(`Failed to download audio: ${error.message}`)
    process.exit(1)
  })
  process.exit(0)
}

if (isWeibo || isTikTok) {
  await useFormats()
  process.exit(0)
}

await ytDlp.downloadAsync(args.url, {
  ...commonOptions,
  output: fileName,
  format: {
    filter: 'mergevideo',
    type: 'mkv',
    quality: 'highest',
  },
}).catch(async (error) => {
  logger.error(`Failed to download video: ${error.message}`)
  await useFormats()
  process.exit(1)
})

function onProgress(progress: VideoProgress) {
  const { downloaded, total, speed_str, status } = progress
  updateProgress({
    current: downloaded,
    total,
    speed: speed_str,
    done: status === 'finished',
    formatter: fmtFileSize,
  })
}

function getFormatId(input: string) {
  const latestFormat = input.split('\n').filter(Boolean).at(-1) || ''
  const [id] = latestFormat.split(' ')
  return id || 'highest'
}

async function useFormats() {
  const formats = await ytDlp.execAsync(args.url, {
    listFormats: true,
  })

  const formatId = getFormatId(formats)

  console.log({
    formatId,
  })

  await ytDlp.downloadAsync(args.url, {
    ...commonOptions,
    output: `${fileName}.mp4`,
    format: formatId,
  }).catch((error) => {
    logger.error(`Failed to download video: ${error.message}`)
    process.exit(1)
  })
}
