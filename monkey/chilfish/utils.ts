import { GM_getValue, GM_setValue } from '$'

// 配合 https://github.com/pushqrdx/vscode-inline-html 插件来高亮语法
let _baseCss = ``
export function css(strings: TemplateStringsArray, ...values: any[]) {
  _baseCss += String.raw(strings, ...values)
}
export const baseCss = () => _baseCss

export const store = {
  get<T>(key: string) {
    const data = GM_getValue(key)
    if (!data) {
      this.set(key, null)
      return null
    }
    return data as T
  },
  set(key: string, value: any) {
    GM_setValue(key, value)
  },
}
