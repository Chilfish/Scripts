import dayjs from 'dayjs'
import logger from './logger'

/**
 * JSON.parse with error handling.
 */
export function safeJSONParse(text: string) {
  try {
    return JSON.parse(text)
  }
  catch (e) {
    logger.error((e as Error).message)
    return null
  }
}

export function isEqual(obj1: any, obj2: any) {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function xssFilter(str: string) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function parseTwitterDateTime(str: string) {
  // "Thu Sep 28 11:07:25 +0000 2023"
  // const regex = /^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/;
  const trimmed = str.replace(/^\w+ (.*)$/, '$1')
  return dayjs(trimmed, 'MMM DD HH:mm:ss ZZ YYYY', 'en')
}

export function formatDateTime(date: string | number | dayjs.Dayjs, format?: string) {
  if (typeof date === 'number' || typeof date === 'string') {
    date = dayjs(date)
  }

  // Display in local time zone.
  return date.format(format)
}

export function formatVideoDuration(durationInMs?: number): string {
  if (typeof durationInMs !== 'number' || Number.isNaN(durationInMs)) {
    return 'N/A'
  }

  const durationInSeconds = Math.floor(durationInMs / 1000)
  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = durationInSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function tweetUrl(id: string, name = 'i') {
  return `https://twitter.com/${name}/status/${id}`
}

export function snowId2millis(id: string) {
  return (BigInt(id) >> BigInt(22)) + BigInt(1288834974657)
}

export function pubTime(id: string) {
  return new Date(Number(snowId2millis(id)))
}
