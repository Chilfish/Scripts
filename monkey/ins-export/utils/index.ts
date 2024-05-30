export function saveAs(
  data: string | object,
  filename: string,
  inline = false,
) {
  let blob: Blob

  if (typeof data === 'string') {
    blob = new Blob([data], { type: 'text/plain' })
  }
  else {
    blob = new Blob(
      [JSON.stringify(data, null, inline ? 0 : 2)],
      { type: 'application/json' },
    )
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  a.remove()
}
export function formatTime(
  time: string | number | Date,
  fmt = 'YYYY-MM-DD HH:mm:ss',
) {
  if (typeof time === 'string')
    time = Number.parseInt(time)
  else if (time instanceof Date)
    time = time.getTime()

  if (Number.isNaN(time))
    return ''

  if (time < 1e12)
    time *= 1000

  const date = new Date(time)

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
