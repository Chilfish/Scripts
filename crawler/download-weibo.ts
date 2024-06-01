import { writeFile } from 'node:fs/promises'
import { defineCommand, runMain } from 'citty'
import { ofetch } from 'ofetch'
import { consola } from 'consola'
import {
  downloadImage,
  getWeiboAnonToken,
  prompt,
} from '../utils'
import { runCommand } from '../utils/node'

interface PicInfo {
  largest: {
    url: string
  }
}

interface PicData {
  pic_infos: { [key: string]: PicInfo }
  pic_num: number
  url_struct: {
    url_title: string
    long_url: string
  }[]
  mix_media_info?: {
    items: {
      type: 'pic' | 'video'
      data: {
        largest: {
          url: string
        }
        media_info: {
          h5_url: string
        }
      }
    }[]
  }
}

const main = defineCommand({
  meta: {
    name: 'download-weibo',
    description: 'Download images/videos from a weibo post',
  },
  args: {
    url: {
      type: 'string',
      description: 'URL of the weibo post',
    },
  },
  run: async ({ args }) => {
    let { url } = args
    if (!url)
      url = await prompt('Enter URL: ')

    const pidMatch = url.match(/https:\/\/weibo\.com\/\d+\/([a-zA-Z0-9]+)\/?/)
    if (!pidMatch) {
      consola.error('Invalid Weibo URL format. Must be like: https://weibo.com/123456789/abcdefg')
      return
    }

    const postId = pidMatch[1]
    const api_url = `https://weibo.com/ajax/statuses/show?id=${postId}`
    const token = await getWeiboAnonToken()

    const data = await ofetch<PicData>(api_url, {
      headers: {
        cookie: token,
      },
    })

    if (data.mix_media_info) {
      for (const item of data.mix_media_info.items) {
        if (item.type === 'pic')
          await downloadImage(item.data.largest.url, '', token)
        else if (item.type === 'video')
          await runCommand(`yt-dlp --cookies-from-browser chrome -P D:/downloads ${item.data.media_info.h5_url}`)
      }

      consola.success('Downloaded all images', data.mix_media_info.items.length)
      return
    }

    if (data.url_struct?.[0].long_url.includes('video.weibo.com'))
      await runCommand(`yt-dlp --cookies-from-browser chrome -P D:/downloads ${url}`)

    if (!data.pic_infos || data.pic_num < 1) {
      consola.error('No images found in the post')
      writeFile('weibo.json', JSON.stringify(data, null, 2))
      return
    }

    const imageList = Object.values(data.pic_infos).map((pic: any) => pic.largest.url)
    for (const imageUrl of imageList)
      await downloadImage(imageUrl, '', token)

    consola.success('Downloaded all images', imageList.length)
  },
})

runMain(main)
