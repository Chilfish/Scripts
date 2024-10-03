function linkify(url: string, text?: string) {
  const style = `
    color: rgb(27, 149, 224);
    text-decoration: none;
    display: inline-block;
  `.replace(/\s+/g, ' ').trim()

  return `<a target="_blank" href="${url}" style="${style}"> ${text || url} </a>`
}

function hashTagLink(tag: string) {
  return linkify(`https://x.com/tags/${tag}`, `#${tag}`)
}

function mentionLink(name: string) {
  return linkify(`https://x.com/${name}`, `@${name}`)
}

export class TextParser {
  private text: string

  constructor(text: string) {
    this.text = text
  }

  parse() {
    return this.links().mentionInfo().hashTags().text
  }

  mentionInfo() {
    const regex = /@(?<username>\w+)\s/g
    this.text = this.text.replace(regex, (_match, username) => {
      return mentionLink(username)
    })
    return this
  }

  hashTags() {
    const regex = /#([\p{L}\p{N}]+)/gu
    this.text = this.text.replace(regex, (_match, tag) => {
      return hashTagLink(tag)
    })
    return this
  }

  links() {
    const regex = /https?:\/\/\S+/g
    this.text = this.text.replace(regex, (match) => {
      return linkify(match)
    })
    return this
  }
}

export function parseText(text: string) {
  return new TextParser(text).parse()
}
