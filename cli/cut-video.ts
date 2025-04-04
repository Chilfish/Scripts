import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import {
  mkdir,
  readFile,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { argvParser } from '../utils/nodejs'

const execAsync = promisify(exec)

const exampleIntervals = [
  '00:00:00,000 ---> 00:00:10,000',
  '00:00:20,000 ---> 00:00:30,000',
  '00:00:40,000 ---> 00:00:50,000',
]

interface TimeInterval {
  start: number
  end: number
}

function printTimeError(): void {
  console.log('Time interval examples:', ...exampleIntervals)
}

function parseTime(timeStr: string): number {
  const [h, m, sMs] = timeStr.split(':')
  const [s, ms] = sMs.split(',')
  return Number.parseInt(h) * 3600 + Number.parseInt(m) * 60 + Number.parseInt(s) + Number.parseInt(ms) / 1000
}

async function readTimeIntervals(filePath: string): Promise<TimeInterval[]> {
  const content = await readFile(filePath, 'utf-8')
  const intervals = content.split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map((line) => {
      const [start, end] = line.split(' ---> ')
      return {
        start: parseTime(start),
        end: parseTime(end),
      }
    })

  // Sort by start time
  return intervals.sort((a, b) => a.start - b.start)
}

async function clipVideo(
  inputPath: string,
  ranges: TimeInterval[],
  outputPath: string,
): Promise<string[]> {
  const keepFiles: string[] = []

  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i]
    const tempOutput = path.join(outputPath, `clip_${String(i).padStart(3, '0')}.mp4`)
    const cmd = [
      'ffmpeg',
      '-ss',
      start.toString(),
      '-to',
      end.toString(),
      '-i',
      `"${inputPath}"`,
      '-c',
      'copy',
      `"${tempOutput}"`,
    ].join(' ')

    await execAsync(cmd)
    keepFiles.push(tempOutput)
  }
  return keepFiles
}

async function getVideoDuration(inputPath: string): Promise<number> {
  const cmd = [
    'ffprobe -v error -show_entries format=duration',
    '-of default=noprint_wrappers=1:nokey=1',
    `"${inputPath}"`,
  ].join(' ')

  const { stdout } = await execAsync(cmd)
  return Number.parseFloat(stdout.trim())
}

async function cutVideo(inputPath: string, intervals: TimeInterval[], outputPath: string, pick: boolean): Promise<void> {
  const tempDir = path.join(path.dirname(outputPath), 'temp_clips')
  const concatFile = path.join(tempDir, 'concat.txt')
  await mkdir(tempDir, { recursive: true })

  if (pick) {
    await clipVideo(inputPath, intervals, tempDir)
    return
  }

  const videoDuration = await getVideoDuration(inputPath)
  const keepSegments: TimeInterval[] = []
  let startOfNextSegment = 0

  for (const { start, end } of intervals) {
    if (startOfNextSegment < start) {
      keepSegments.push({ start: startOfNextSegment, end: start })
    }
    startOfNextSegment = end
  }

  if (startOfNextSegment < videoDuration) {
    keepSegments.push({ start: startOfNextSegment, end: videoDuration })
  }

  const keepFiles = await clipVideo(inputPath, keepSegments, tempDir)

  await writeFile(
    concatFile,
    keepFiles.map(file => `file '${file}'`).join('\n'),
    'utf-8',
  )

  const concatCmd = [
    'ffmpeg -f concat -safe 0',
    `-i "${concatFile}"`,
    '-c copy',
    `"${outputPath}"`,
  ].join(' ')

  await execAsync(concatCmd)

  // Cleanup
  await Promise.all(keepFiles.map(file => unlink(file)))
  await unlink(concatFile)
  await rmdir(tempDir)
}

const args = argvParser([
  {
    key: 'input',
    description: 'The input video file path',
    type: 'string',
    required: true,
  },
  {
    key: 'pick',
    description: 'Pick the video segments',
    type: 'boolean',
    default: false,
  },
] as const)

async function main() {
  const inputVideoPath = args.input
  const pick = args.pick
  const videosDirectory = path.join('F:/Videos')
  const timeIntervalsFile = path.join(videosDirectory, 'time_intervals.txt')

  const videoName = path.basename(inputVideoPath)
  const outputVideoPath = path.join(videosDirectory, `cut-${videoName}`)

  if (!existsSync(inputVideoPath)) {
    console.log('Input video file does not exist!')
    return
  }

  if (!existsSync(timeIntervalsFile)) {
    console.log(`Time intervals file does not exist! Please create ${timeIntervalsFile} with time interval information.`)
    printTimeError()

    await writeFile(timeIntervalsFile, exampleIntervals.join('\n'), 'utf-8')
    return
  }

  const intervals = await readTimeIntervals(timeIntervalsFile)
  if (intervals.length === 0) {
    console.log('No time intervals found in the file!')
    printTimeError()
    return
  }

  console.log(intervals)
  await cutVideo(inputVideoPath, intervals, outputVideoPath, pick)

  if (pick) {
    console.log(`Video segments extracted, saved in: ${path.join(path.dirname(outputVideoPath), 'temp_clips')}`)
  }
  else {
    console.log(`Video processing complete, output file at: ${outputVideoPath}`)
  }
}

main().catch(console.error)
