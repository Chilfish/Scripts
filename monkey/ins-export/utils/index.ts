export const $ = <T = HTMLElement>(selector: string, root: any = document) => root?.querySelector(selector) as T | null

export const $$ = <T = HTMLElement>(selector: string, root: any = document) => Array.from(root?.querySelectorAll(selector) || []) as T[]

export const dealy = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function saveBlobUrl(url: string, filename: string) {
  console.log(`Downloaded: ${filename} (${url})`)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  a.remove()
}

export function saveAs(
  data: string | object | Blob,
  filename: string,
  inline = false,
) {
  let blob: Blob

  if (typeof data === 'string') {
    blob = new Blob([data], { type: 'text/plain' })
  }
  else if (data instanceof Blob) {
    blob = data
  }
  else {
    blob = new Blob(
      [JSON.stringify(data, null, inline ? 0 : 2)],
      { type: 'application/json' },
    )
  }

  const url = URL.createObjectURL(blob)
  saveBlobUrl(url, filename)
  URL.revokeObjectURL(url)
}

export function formatTime(
  time: string | number | Date,
  fmt = 'YYYY-MM-DD HH:mm:ss',
) {
  if (typeof time === 'number' && time < 1e12)
    time *= 1000

  const date = new Date(time)
  if (Number.isNaN(date.getTime()))
    return ''

  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  const hour = date.getHours().toString()
  const minute = date.getMinutes().toString()
  const second = date.getSeconds().toString()

  return fmt
    .replace('YYYY', year)
    .replace('MM', month.padStart(2, '0'))
    .replace('DD', day.padStart(2, '0'))
    .replace('HH', hour.padStart(2, '0'))
    .replace('mm', minute.padStart(2, '0'))
    .replace('ss', second.padStart(2, '0'))
}

export function parseJson<T = any>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  }
  catch {
    return null
  }
}
