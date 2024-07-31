### 一些自用的脚本

不负责任地随缘维护更新）

必要依赖：[tsx: ts 运行器](https://github.com/privatenumber/tsx)、ffmpeg、nodejs>=20、Python3

- [cli/srt](cli/srt.ts)：提取字幕或翻译 srt 字幕文件
- [bestdori](crawler/bestdori/)：BanG Dream！bestdori 相关爬虫
- [monkey](monkey/)：一些油猴脚本
  - [twitter-media.user.js](monkey/twitter-media.user.js)：下载推特原图（改自 [twitter-media-downloader](https://greasyfork.org/zh-CN/scripts/423001-twitter-media-downloader)）
  - [ins-download.user.js](monkey/ins-download.user.js)：下载 ins 图片、快拍
  - [ins-exporter.user.js](monkey/ins-exporter.user.js)：导出 ins 用户的帖子数据
  - [katakana-terminator.user.js](monkey/katakana-terminator.user.js)：修改后的片假名标翻译
- [video-dlp.py](python/video-dlp.py)：全速地下载一系列视频
- [cut-video.py](python/cut-video.py)：快速视频切片
- [PowerShell_profile.ps1](pwsh/Microsoft.PowerShell_profile.ps1)：Powershell 的配置文件
- [download-weibo.ts](crawler/download-weibo.ts)： 下载微博图片/视频
- [twitter-rss](crawler/twitter/rss.ts)：启动一个本地的 twitter 搜索的 rss 服务器 http://localhost:3456/search/:keyword 。需要先获取完整 cookies 到 README.md 同级的 cookie.txt

使用 [twitter-web-exporter](https://github.com/prinsss/twitter-web-exporter) 插件导出推文 json 后，用 [tweets.ts](crawler/twitter/tweets.ts) 解析必要数据，用 [tweets-img.ts](crawler/twitter-img.ts) 下载导出的图片。图片格式为 `YYYYMMDD_HHMMSS_{status_id}`，这样既可以快速知道图片的日期，要查看原推文则 `https://twitter.com/i/status/{status_id}`
