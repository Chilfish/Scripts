import { ofetch } from "ofetch";
import { load as loadHTML } from 'cheerio'
import { downloadFiles } from "~/utils/nodejs";

const data = await ofetch('https://api.fesapp.jp/api/news_articles/6660')

const body = data.Response.body

const $ = loadHTML(body)

const imgs = $('img')
    .map((_i, photo) => photo.attribs.src)
    .filter(Boolean)
    .get()
console.log(imgs)

await downloadFiles(imgs)
