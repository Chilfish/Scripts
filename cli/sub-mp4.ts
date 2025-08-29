import { execSync } from 'node:child_process'
import { cp, rm } from 'node:fs/promises'
import path from 'node:path'
import { argvParser } from '../utils/nodejs/cli'
import { which } from '../utils/nodejs/which'

/***
 * Muxing a video and a subtitle file into a single file
 */

const args = argvParser([{
  key: 'input',
  shortKey: 'i',
  description: 'The video file to be converted',
  required: true,
  beforeSet: path.resolve,
}, {
  key: 'subtitle',
  shortKey: 's',
  description: 'The subtitle file to be inserted',
  default: '',
  beforeSet: path.resolve,
}] as const)

let { input, subtitle } = args

const inputDir = path.dirname(input)
const inputName = path.basename(input, `.${input.split('.').pop()}`)

if (!subtitle) {
  subtitle = path.resolve(inputDir, `${inputName}.ass`)
}

const output = path.resolve(inputDir, `${inputName} - subtitle.mp4`)
const subtitleTmp = 'tmp.ass'
const subtitleTmpPath = path.resolve(process.cwd(), subtitleTmp)

await cp(
  subtitle,
  subtitleTmpPath,
  {
    force: true,
  },
).catch((err) => {
  console.warn('未指定字幕文件，或者视频目录内没有同名的字幕文件', err)
  process.exit(1)
})

const ffmpegBin = await which('ffmpeg')

const ffmpegArgs = [
  // '-itsoffset', '1.5', // 假设字幕比视频慢2秒，这里让字幕早2秒开始处理
  '-i',
  `"${input}"`,
  '-vf',
  `subtitles="${subtitleTmp}"`,
  '-c:v libx264',
  '-c:a aac',
  '-b:a 192k',
  '-crf 25',
  '-preset superfast',
  '-movflags faststart',
  '-y',
  `"${output}"`,
]

const command = `${ffmpegBin} ${ffmpegArgs.join(' ')}`

console.log(`\ncommand:\n${command}\n`)

execSync(command, {
  stdio: 'inherit',
})

await rm(subtitleTmpPath)
