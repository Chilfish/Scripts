export interface UrlActions {
  pattern: RegExp
  css: () => string
  action: () => any
}
