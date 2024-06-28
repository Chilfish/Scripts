export interface RSSItem {
  title: string
  link: string
  pubDate: string
  content: string
  author: string
}

export interface RSSFeed {
  title: string
  description: string
  link: string
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
          <title>${item.title}</title>
          <author>${item.author}</author>
          <link>${item.link}</link>
          <pubDate>${item.pubDate}</pubDate>
          <content:encoded>${item.content.replace('&', '＆')}</content:encoded>
        </item>
        `,
      ).join('')}
    </channel>
</rss>`

  return xml
}
