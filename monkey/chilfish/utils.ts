// 配合 https://github.com/pushqrdx/vscode-inline-html 插件来高亮语法
let _baseCss = ``
export function css(strings: TemplateStringsArray, ...values: any[]) {
  if (!strings.length)
    return
  _baseCss += String.raw(strings, ...values)
}
export const baseCss = () => _baseCss
