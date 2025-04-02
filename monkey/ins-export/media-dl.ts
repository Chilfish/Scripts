import { GM_registerMenuCommand } from '$'
import { formatDate } from '~/utils/date'
import { $, $$, saveAs } from '~/utils/dom'
import { delay } from '~/utils/math'

function findImgBox() {
  let imgBox = $('.x6s0dn4.x1dqoszc.xu3j5b3.xm81vs4.x78zum5.x1iyjqo2.x1tjbqro')
  if (isProfile())
    imgBox = $('article[role="presentation"] ._aatk._aatl._aatm')

  console.log(imgBox)
  return imgBox as HTMLElement
}

async function findImgs(imgBox: HTMLElement) {
  const urls = new Set<string>()

  while (true) {
    const img = $$('img', imgBox) as HTMLImageElement[]
    img.map(i => urls.add(i.src))

    const nextBtn = $('button[aria-label="Next"]')
    console.log(urls)
    if (!nextBtn)
      return Array.from(urls)

    nextBtn.click()
    await delay(800)
  }
}

function isProfile() {
  return !!$('h2')
}

async function doanload(url: string, filename: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': navigator.userAgent,
    },
    mode: 'cors',
  })
  const blob = await res.blob()

  saveAs(blob, filename)
}

async function main() {
  const imgBox = findImgBox()
  const imgs = await findImgs(imgBox)
  const time = $<HTMLTimeElement>('time', imgBox.nextElementSibling!)?.dateTime || Date.now()
  const id = location.pathname.split('/').at(-2)

  console.log({ imgs, time, id })

  let idx = 0
  for (const img of imgs) {
    const suffix = imgs.length > 1 ? `-${++idx}` : ''
    const filename = `${formatDate(time)}-${id}${suffix}.jpg`
    await doanload(img, filename)
  }
}

GM_registerMenuCommand('下载媒体', main)
