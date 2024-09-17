import { load as loadHTML } from 'cheerio'
import { ofetch } from 'ofetch'
import { downloadBlob } from '~/utils/download'

const url = 'https://api.fesapp.jp/api/news_articles/5981'

const { Response: data } = await ofetch(url)

const html = loadHTML(data.body)

const imgs = html('img').map((_, el) => html(el).attr('src')).get()

for (const img of imgs) {
  await downloadBlob({
    url: img,
    raw: true,
    followRedirect: true,
  })
}
