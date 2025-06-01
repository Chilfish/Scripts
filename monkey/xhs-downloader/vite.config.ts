import { viteConfig } from '../common'
import { iconBase64 } from './constants'

export default viteConfig({
  name: '小红书下载工具',
  filename: 'xhs-downloader',
  entry: 'main.ts',
  userscript: {
    'version': '2.1.1',
    'run-at': 'document-end',
    'description': '提取小红书作品/用户链接，下载小红书无水印图文/视频作品文件',
    'icon': iconBase64,
    'match': [
      'http*://xhslink.com/*',
      'http*://www.xiaohongshu.com/explore*',
      'http*://www.xiaohongshu.com/user/profile/*',
      'http*://www.xiaohongshu.com/search_result*',
      'http*://www.xiaohongshu.com/board/*',
    ],
    'license': 'GNU General Public License v3.0',
    'author': 'JoeanAmier, Chilfish',
    'require': [],
  },
  build: {
    externalGlobals: {},
  },
})
