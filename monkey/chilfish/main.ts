import type { UrlActions } from './types'
import { GM_addStyle } from '$'
import { $, $$, css } from '~/utils/dom'

const baseCss = css`
html::-webkit-scrollbar {
  width: 8px;height: 8px;
}
html::-webkit-scrollbar-track {
  border-radius: 8px;background-color: transparent;
}
html::-webkit-scrollbar-thumb {
  border-radius: 8px;background-color: #7a797963;
}
html {
  scrollbar-width: thin!important;
}
*, *:focus-visible{
  outline:none;
  box-shadow:none;
}
body {
  overflow-anchor: none;
}
:root:where(:lang(zh)) {
  --vp-font-family-base: 'Inter';
}
`
GM_addStyle(baseCss)

const url = document.location.href

const modules = import.meta.glob('./modules/*.ts', {
  eager: true,
}) as Record<string, { default: UrlActions }>

for (const path in modules) {
  const module = modules[path].default
  if (module.pattern.test(url)) {
    module.action()
    GM_addStyle(module.css?.() ?? '')
  }
}

Object.assign(window, {
  _$: $,
  _$$: $$,
})
