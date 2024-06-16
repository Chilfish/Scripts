### BanG Dream! 手游相关爬虫

数据来源于 [bestdori](https://bestdori.com)

- [story.ts](./story.ts)：获取所有的卡面剧情、无卡面的生日剧情 文件，配合 [发表故事](https://bestdori.com/community/stories/new) 使用。主要用于新剧情的查看、翻译等等
- [index.ts](./index.ts)：杂项，包含了一些诸如乐队信息、区域信息、地图的剧情列表

文件列表可从 `https://bestdori.com/api/explorer/jp/assets/_info.json` 获取

`/sound/voice` 包含了所有的配音文件，带有 `Scenario` 的都是剧情相关的资源

卡面可在 `/characters/resourceset` 中找到，命名规则是：`res{角色id}{卡面序号}`，信息如下：

```json
[
  { "id": 1, "bandId": 1, "name": "户山香澄" },
  { "id": 2, "bandId": 1, "name": "花园多惠" },
  { "id": 3, "bandId": 1, "name": "牛込里美" },
  { "id": 4, "bandId": 1, "name": "山吹沙绫" },
  { "id": 5, "bandId": 1, "name": "市谷有咲" },
  { "id": 6, "bandId": 2, "name": "美竹兰" },
  { "id": 7, "bandId": 2, "name": "青叶摩卡" },
  { "id": 8, "bandId": 2, "name": "上原绯玛丽" },
  { "id": 9, "bandId": 2, "name": "宇田川巴" },
  { "id": 10, "bandId": 2, "name": "羽泽鸫" },
  { "id": 11, "bandId": 3, "name": "弦卷心" },
  { "id": 12, "bandId": 3, "name": "濑田薰" },
  { "id": 13, "bandId": 3, "name": "北泽育美" },
  { "id": 14, "bandId": 3, "name": "松原花音" },
  { "id": 15, "bandId": 3, "name": "奥泽美咲" },
  { "id": 16, "bandId": 4, "name": "丸山彩" },
  { "id": 17, "bandId": 4, "name": "冰川日菜" },
  { "id": 18, "bandId": 4, "name": "白鹭千圣" },
  { "id": 19, "bandId": 4, "name": "大和麻弥" },
  { "id": 20, "bandId": 4, "name": "若宫伊芙" },
  { "id": 21, "bandId": 5, "name": "凑友希那" },
  { "id": 22, "bandId": 5, "name": "冰川纱夜" },
  { "id": 23, "bandId": 5, "name": "今井莉莎" },
  { "id": 24, "bandId": 5, "name": "宇田川亚子" },
  { "id": 25, "bandId": 5, "name": "白金燐子" },
  { "id": 26, "bandId": 21, "name": "仓田真白" },
  { "id": 27, "bandId": 21, "name": "桐谷透子" },
  { "id": 28, "bandId": 21, "name": "广町七深" },
  { "id": 29, "bandId": 21, "name": "二叶筑紫" },
  { "id": 30, "bandId": 21, "name": "八潮瑠唯" },
  { "id": 31, "bandId": 18, "name": "和奏瑞依" },
  { "id": 32, "bandId": 18, "name": "朝日六花" },
  { "id": 33, "bandId": 18, "name": "佐藤益木" },
  { "id": 34, "bandId": 18, "name": "鳰原令王那" },
  { "id": 35, "bandId": 18, "name": "珠手知由" },
  { "id": 36, "bandId": 45, "name": "高松灯" },
  { "id": 37, "bandId": 45, "name": "千早爱音" },
  { "id": 38, "bandId": 45, "name": "要乐奈" },
  { "id": 39, "bandId": 45, "name": "长崎爽世" },
  { "id": 40, "bandId": 45, "name": "椎名立希" }
]
```

一般来说新卡和剧情在发布的前一天，北京时间下午六七点就上线了）
