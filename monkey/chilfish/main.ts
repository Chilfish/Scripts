import { GM_addStyle } from '$'
import { modules } from './modules'
import { baseCss, css } from './utils'

css`
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

const url = document.location.href

modules.forEach((module) => {
  if (module.pattern.test(url)) {
    module.action()
  }
})

GM_addStyle(baseCss())
