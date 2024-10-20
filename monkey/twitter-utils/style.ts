import { GM_addStyle } from '$'
import { css } from '../utils'

const style = css`
div, span {
  font-family: 'Microsoft YaHei' !important;
}
`

GM_addStyle(style)
