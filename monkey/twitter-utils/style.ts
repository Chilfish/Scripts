import { GM_addStyle } from '$'

function css(strings: TemplateStringsArray) {
  return String.raw(strings)
}

const style = css`
div, span {
  font-family: 'Microsoft YaHei' !important;
}
`

GM_addStyle(style)
