import { httpHooks } from './httpHook'
import modules from './modules'
import { createExportButton } from './ui'

// 默认启用数据收集
httpHooks(modules)

// 创建导出按钮
createExportButton()

console.debug('ins-export loaded')
