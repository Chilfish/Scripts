import dayjs from 'dayjs'
import { readJson, writeJson } from '~/utils/file'

// 获取往年今日的数据
function getLastYearsTodayData(dataArray: any[]) {
  const today = dayjs()
  const lastYearsToday = today.subtract(1, 'year')
  return dataArray.filter((el) => {
    const createdAt = dayjs(el.created_at)
    return createdAt.isSame(lastYearsToday, 'day')
  })
}

const data = await readJson('data/twitter/data-after.json')
const lastYearsTodayData = getLastYearsTodayData(data.tweets)

await writeJson('data/twitter/lastYearToday.json', lastYearsTodayData)
