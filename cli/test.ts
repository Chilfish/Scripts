import { load as loadHTML } from 'cheerio'
import { ofetch } from 'ofetch'

const html = await ofetch('https://bushiroad-store.com/collections/mygo')

const $ = loadHTML(html)
const goods = $('.product-list.product-list--collection .product-item')

const items = goods.map((_, el) => {
  const $el = $(el)
  const title = $el.find('.product-item__title').text().trim()
  const link = $el.find('a').attr('href')
  const price = $el.find('.price').text().trim().replace('販売価格', '')
  const date = $el.find('.product__release-date').text().trim().replace('発売予定', '')
    || $el.find('.product__show-text-sale').text().trim() || '未定'

  return {
    title,
    price,
    date,
    link: `https://bushiroad-store.com${link}`,
  }
}).get()
console.log(items)
