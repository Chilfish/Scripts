export interface RSSItem {
  title: string
  link: string
  pubDate: string
  content: string
  author: string
  image?: string
}

export interface RSSFeed {
  title: string
  description: string
  link: string
}

function encode2Safe(input: string): string {
  const tagsToReplace: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '`': '&#96;',
  }
  return input.replace(/[&<>"'`]/g, tag => tagsToReplace[tag] || tag)
}

function text2html(text: string): string {
  // 将每一段文本用 <p> 标签包裹
  const lineBreakRegex = /(.+)(?:\n|$)/g

  const str = text.replace(lineBreakRegex, '<p>$1</p>')
  return encode2Safe(str)
}

/**
 * convert json to rss feed xml
 */
export function json2rss(
  feed: RSSFeed,
  items: RSSItem[],
): string {
  const xml = `<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
  <script/>
  <channel>
    <title>${feed.title}</title>
    <description>${feed.description}</description>
    <link>${feed.link}</link>
    ${items.map(item =>
        `<item>
        <title>${encode2Safe(item.title)}</title>
        <author>${encode2Safe(item.author)}</author>
        <link>${item.link}</link>
        <pubDate>${item.pubDate}</pubDate>
        <content:encoded type="html">${text2html(item.content)}</content:encoded>
        ${item.image
            ? `<enclosure url="${encode2Safe(item.image)}" type="image/jpeg" length="0"/>`
            : ''}
      </item>`,
      ).join('\n')}
  </channel>
</rss>`

  return xml
}
