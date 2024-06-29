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

function encodeToSafe(input: string): string {
  const entitiesMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;',
    ' ': '%20',
  }

  // 替换字符串中的特殊字符为对应的 URL 实体
  return input.replace(/[&<>"']/g, match => entitiesMap[match])
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
          <title>${encodeToSafe(item.title)}</title>
          <author>${encodeToSafe(item.author)}</author>
          <link>${item.link}</link>
          <pubDate>${item.pubDate}</pubDate>
          <content:encoded>${encodeToSafe(item.content)}</content:encoded>
          ${item.image
          ? `<enclosure url="${encodeToSafe(item.image)}" type="image/jpeg" length="0"/>`
          : ''}
        </item>
        `,
      ).join('')}
    </channel>
</rss>`

  return xml
}
