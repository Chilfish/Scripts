import fs from 'node:fs/promises'
import path from 'node:path'

const info = [
  { id: 1, bandId: 1, name: '户山香澄' },
  { id: 2, bandId: 1, name: '花园多惠' },
  { id: 3, bandId: 1, name: '牛込里美' },
  { id: 4, bandId: 1, name: '山吹沙绫' },
  { id: 5, bandId: 1, name: '市谷有咲' },
  { id: 6, bandId: 2, name: '美竹兰' },
  { id: 7, bandId: 2, name: '青叶摩卡' },
  { id: 8, bandId: 2, name: '上原绯玛丽' },
  { id: 9, bandId: 2, name: '宇田川巴' },
  { id: 10, bandId: 2, name: '羽泽鸫' },
  { id: 11, bandId: 3, name: '弦卷心' },
  { id: 12, bandId: 3, name: '濑田薰' },
  { id: 13, bandId: 3, name: '北泽育美' },
  { id: 14, bandId: 3, name: '松原花音' },
  { id: 15, bandId: 3, name: '奥泽美咲' },
  { id: 601, bandId: 3, name: '奥泽美咲' },
  { id: 16, bandId: 4, name: '丸山彩' },
  { id: 17, bandId: 4, name: '冰川日菜' },
  { id: 18, bandId: 4, name: '白鹭千圣' },
  { id: 19, bandId: 4, name: '大和麻弥' },
  { id: 20, bandId: 4, name: '若宫伊芙' },
  { id: 21, bandId: 5, name: '凑友希那' },
  { id: 22, bandId: 5, name: '冰川纱夜' },
  { id: 23, bandId: 5, name: '今井莉莎' },
  { id: 24, bandId: 5, name: '宇田川亚子' },
  { id: 25, bandId: 5, name: '白金燐子' },
  { id: 26, bandId: 21, name: '仓田真白' },
  { id: 27, bandId: 21, name: '桐谷透子' },
  { id: 28, bandId: 21, name: '广町七深' },
  { id: 29, bandId: 21, name: '二叶筑紫' },
  { id: 30, bandId: 21, name: '八潮瑠唯' },
  { id: 31, bandId: 18, name: '和奏瑞依' },
  { id: 32, bandId: 18, name: '朝日六花' },
  { id: 33, bandId: 18, name: '佐藤益木' },
  { id: 34, bandId: 18, name: '鳰原令王那' },
  { id: 35, bandId: 18, name: '珠手知由' },
  { id: 36, bandId: 45, name: '高松灯' },
  { id: 37, bandId: 45, name: '千早爱音' },
  { id: 38, bandId: 45, name: '要乐奈' },
  { id: 39, bandId: 45, name: '长崎爽世' },
  { id: 40, bandId: 45, name: '椎名立希' },
]

const band = [
  { id: 1, name: 'PO' },
  { id: 2, name: 'AG' },
  { id: 3, name: 'HW' },
  { id: 4, name: 'PP' },
  { id: 5, name: 'RO' },
  { id: 18, name: 'RS' },
  { id: 21, name: 'MF' },
  { id: 45, name: 'mygo' },
]

const dir = 'D:/Downloads/bestdori/voice/'

async function moveMp3() {
  const folders = (await fs.readdir(dir))
    .filter(name => band.some(b => name.includes(b.name)))
  console.log('total', folders.length)

  for (const { id, bandId, name } of info) {
    const bandName = band.find(b => b.id === bandId)?.name
    if (!bandName)
      continue

    const _id = `${id.toString().padStart(3, '0')}`
    const regex = new RegExp(`${_id}`)
    const from = path.join(dir, bandName)

    const files = (await fs.readdir(from))
      .filter(name => regex.test(name))

    console.log(name, files.length, regex)

    if (files.length === 0)
      console.log('No files found for', name)

    for (const file of files) {
      const oldPath = path.join(from, file)
      const newPath = path.join(dir, name)
      await fs.rename(oldPath, `${newPath}/${file}`)
    }
  }
}

await moveMp3()

// const target = path.join(dir, 'skill')
// const folders = await fs.readdir(target)

// for (const folder of folders) {
//   const to = path.join(dir, folder)
//   if (!existsSync(to))
//     await fs.mkdir(to, { recursive: true })

//   const files = await fs.readdir(path.join(target, folder))

//   console.log(folder, files.length)
//   if (files.length === 0)
//     await fs.rmdir(path.join(target, folder))

//   for (const file of files) {
//     await fs.rename(path.join(target, folder, file), path.join(to, file))
//   }
// }
