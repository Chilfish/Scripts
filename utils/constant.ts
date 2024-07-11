import { randomInt } from './math'

interface DeviceInfo {
  ua: string
  width: number
  height: number
}

type Devices = 'mobile' | 'desktop'

const ua_ios = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
const ua_android = 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
const ua_windows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const ua_mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 uacq'
const ua_linux = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 uacq'

export function randomUserAgent(mobile = false) {
  const mobiles = [ua_ios, ua_android]
  const desktops = [ua_windows, ua_mac, ua_linux]
  const uas = mobile ? mobiles : desktops
  return uas[randomInt(0, uas.length - 1)]
}

export const devices: Record<Devices, DeviceInfo> = {
  mobile: {
    ua: randomUserAgent(true),
    width: 468,
    height: 890,
  },
  desktop: {
    ua: randomUserAgent(),
    width: 1552,
    height: 1000,
  },
}

export const proxyUrl = 'http://127.0.0.1:7890'
