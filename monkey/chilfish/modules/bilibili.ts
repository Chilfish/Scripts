import { $, waitForElement } from '~/monkey/utils'
import { numFmt } from '~/utils/math'
import { UrlActions } from '../types'

export default {
  pattern: /space\.bilibili\.com/,
  action: () => window.addEventListener('load', async () => {
    await waitForElement('.n-fs', true)

    $('#n-fs')!.textContent = numFmt($('.n-fs')!.title.replaceAll(',', ''))
  }),
} satisfies UrlActions
