import imgDownload from './imgDownload'
import rmRetweets from './rmRetweets'

const modules = [
  imgDownload,
  rmRetweets,
] as {
  tagName: string
  action: (el: HTMLElement) => any
  style?: string
}[]

export function observeDoms() {
  const styles = modules.map(({ style }) => style)
    .filter(Boolean)
    .join('\n')
    .replace(/\\n|\n| {2}/g, '')

  document.head.insertAdjacentHTML('beforeend', `<style id="twitter-utils">${styles}</style>`)

  const observer = new MutationObserver(ms => ms.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        mutation.type !== 'childList'
        || node.nodeType !== Node.ELEMENT_NODE
      ) {
        return
      }

      const el = node as HTMLElement
      modules.forEach(({ tagName, action }) => {
        if (el.tagName === tagName.toUpperCase()) {
          action(el)
        }
      })
    })
  }))

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  })
}
