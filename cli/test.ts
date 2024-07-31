import { scheduler, setInterval, setTimeout } from 'node:timers/promises'

const res = await setTimeout(1000, {
  hello: 'world',
})

await scheduler.wait(1000)
console.log(res)

const interval = 1000
for await (const startTime of setInterval(interval, Date.now())) {
  const now = Date.now()
  console.log(now)
  if (now - startTime > 2000) {
    break
  }
}
