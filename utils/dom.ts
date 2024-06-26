export const $ = <T = HTMLElement>(selector: string, root: any = document) => root?.querySelector(selector) as T | null

export const $$ = <T = HTMLElement>(selector: string, root: any = document) => Array.from(root?.querySelectorAll(selector) || []) as T[]

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
