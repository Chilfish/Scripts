// ==UserScript==
// @name        Katakana Terminator
// @name:ja-JP  カタカナターミネーター
// @name:zh-CN  片假名终结者
// @description Convert gairaigo (Japanese loan words) back to English
// @description:zh-CN 在网页中的日语外来语上方标注英文原词
// @author      Arnie97
// @license     MIT
// @version     2024.05.13
// @copyright   2017-2024, Katakana Terminator Contributors (https://github.com/Arnie97/katakana-terminator/graphs/contributors)
// @namespace   https://github.com/Arnie97
// @homepageURL https://github.com/Arnie97/katakana-terminator
// @supportURL  https://greasyfork.org/scripts/33268/feedback
// @icon        https://upload.wikimedia.org/wikipedia/commons/2/28/Ja-Ruby.png
// @match       *://*/*
// @grant       GM.xmlHttpRequest
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @grant       GM_addStyle
// @grant       unsafeWindow
// @run-at      document-end
// @connect     translate.google.cn
// @connect     translate.google.com
// @connect     translate.googleapis.com
// @downloadURL  https://github.com/Chilfish/katakana-terminator/raw/master/katakana-terminator.user.js
// @updateURL    https://github.com/Chilfish/katakana-terminator/raw/master/katakana-terminator.meta.js
// ==/UserScript==

// define some shorthands
const _ = document

const queue = {} // {"カタカナ": [rtNodeA, rtNodeB]}
let cachedTranslations = GM_getValue('cachedTranslations', {}) || {}
cachedTranslations = Object.keys(cachedTranslations)
  .sort()
  .reduce((sorted, key) => {
    sorted[key] = cachedTranslations[key]
    return sorted
  }, {})

GM_setValue('cachedTranslations', cachedTranslations)

const newNodes = [_.body]
const apiList = [
  {
    // https://github.com/Arnie97/katakana-terminator/pull/8
    name: 'Google Translate',
    hosts: ['translate.googleapis.com'],
    path: '/translate_a/single',
    params(phrases) {
      const joinedText = phrases.join('\n').replace(/\s+$/, '')
      return {
        sl: 'ja',
        tl: 'en',
        dt: 't',
        client: 'gtx',
        q: joinedText,
      }
    },
    callback(phrases, resp) {
      resp[0].forEach((item) => {
        const translated = item[0].replace(/\s+$/, '')
        const original = item[1].replace(/\s+$/, '')
        cachedTranslations[original] = translated
        updateRubyByCachedTranslations(original)
      })
      GM_setValue('cachedTranslations', cachedTranslations)
    },
  },
  {
    // https://github.com/ssut/py-googletrans/issues/268
    name: 'Google Dictionary',
    hosts: ['translate.google.cn'],
    path: '/translate_a/t',
    params(phrases) {
      const joinedText = phrases.join('\n').replace(/\s+$/, '')
      return {
        sl: 'ja',
        tl: 'en',
        dt: 't',
        client: 'dict-chrome-ex',
        q: joinedText,
      }
    },
    callback(phrases, resp) {
      // ["katakana\nterminator"]
      if (!resp.sentences) {
        const translated = resp[0].split('\n')
        if (translated.length !== phrases.length)
          throw new Error('Katakana Terminator: invalid response', phrases, translated)

        translated.forEach((trans, i) => {
          const orig = phrases[i]
          cachedTranslations[orig] = trans
          updateRubyByCachedTranslations(orig)
        })
        GM_setValue('cachedTranslations', cachedTranslations)
        return
      }

      resp.sentences.forEach((s) => {
        if (!s.orig)
          return

        const original = s.orig.trim()
        const translated = s.trans.trim()
        cachedTranslations[original] = translated
        updateRubyByCachedTranslations(original)
      })
      GM_setValue('cachedTranslations', cachedTranslations)
    },
  },
]

// Recursively traverse the given node and its descendants (Depth-first search)
function scanTextNodes(node) {
  // The node could have been detached from the DOM tree
  if (!node.parentNode || !_.body.contains(node))
    return

  // Ignore text boxes and echoes
  const excludeTags = { ruby: true, script: true, select: true, textarea: true }

  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName.toLowerCase() in excludeTags || node.isContentEditable)
      return

    return Array.from(node.childNodes).forEach(scanTextNodes)
  }

  else if (node.nodeType === Node.TEXT_NODE) {
    do
      node = addRuby(node)
    while (node)
  }
}

// Recursively add ruby tags to text nodes
// Inspired by http://www.the-art-of-web.com/javascript/search-highlight/
function addRuby(node) {
  const katakana = /[\u30A1-\u30FA\u30FD-\u30FF][\u3099\u309A\u30A1-\u30FF]*[\u3099\u309A\u30A1-\u30FA\u30FC-\u30FF]|[\uFF66-\uFF6F\uFF71-\uFF9D][\uFF65-\uFF9F]*[\uFF66-\uFF9F]/
  const match = katakana.exec(node.nodeValue)

  if (!node.nodeValue || !match)
    return false

  const ruby = _.createElement('ruby')
  ruby.appendChild(_.createTextNode(match[0]))
  const rt = _.createElement('rt')
  rt.classList.add('katakana-terminator-rt')
  rt.style.visibility = 'hidden'
  ruby.appendChild(rt)

  // Append the ruby title node to the pending-translation queue
  queue[match[0]] = queue[match[0]] || []
  queue[match[0]].push(rt)

  // <span>[startカナmiddleテストend]</span> =>
  // <span>start<ruby>カナ<rt data-rt="Kana"></rt></ruby>[middleテストend]</span>
  const after = node.splitText(match.index)
  const parentNode = node.parentNode
  parentNode.insertBefore(ruby, after)
  after.nodeValue = after.nodeValue.substring(match[0].length)

  return after
}

// Split word list into chunks to limit the length of API requests
function translateTextNodes() {
//   const apiRequestCount = 0
  //   let phraseCount = 0
  const chunkSize = 200
  let chunk = []

  for (const phrase in queue) {
    // phraseCount++
    if (phrase in cachedTranslations) {
      updateRubyByCachedTranslations(phrase)
      continue
    }

    chunk.push(phrase)
    if (chunk.length >= chunkSize) {
    //   apiRequestCount++
      translate(chunk, apiList)
      chunk = []
    }
  }

  if (chunk.length) {
    // apiRequestCount++
    translate(chunk, apiList)
  }

//   if (phraseCount)
  // console.debug('Katakana Terminator:', phraseCount, 'phrases translated in', apiRequestCount, 'requests, frame', window.location.href)
}

// {"keyA": 1, "keyB": 2} => "?keyA=1&keyB=2"
function buildQueryString(params) {
  return `?${Object.keys(params).map((k) => {
        return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
    }).join('&')}`
}

function translate(phrases) {
  if (!apiList.length) {
    console.error('Katakana Terminator: fallbacks exhausted', phrases)
    phrases.forEach((phrase) => {
      delete cachedTranslations[phrase]
    })
  }

  // Prevent duplicate HTTP requests before the request completes
  phrases.forEach((phrase) => {
    cachedTranslations[phrase] = null
  })

  const api = apiList[0]
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://${api.hosts[0]}${api.path}${buildQueryString(api.params(phrases))}`,
    onload(dom) {
      try {
        api.callback(phrases, JSON.parse(dom.responseText.replace('\'', '\u2019')))
      }
      catch (err) {
        console.error('Katakana Terminator: invalid response', err, dom.responseText)
        apiList.shift()
        return translate(phrases)
      }
    },
    onerror() {
      console.error('Katakana Terminator: request error', api.url)
      apiList.shift()
      return translate(phrases)
    },
  })
}

// Clear the pending-translation queue
function updateRubyByCachedTranslations(phrase) {
  if (!cachedTranslations[phrase])
    return;

  (queue[phrase] || []).forEach((node) => {
    node.dataset.rt = cachedTranslations[phrase]
  })
  delete queue[phrase]
}

// Watch newly added DOM nodes, and save them for later use
function mutationHandler(mutationList) {
  mutationList.forEach((mutationRecord) => {
    mutationRecord.addedNodes.forEach((node) => {
      newNodes.push(node)
    })
  })
}

function rescanTextNodes() {
  const observer = new MutationObserver(mutationHandler)
  observer.observe(_.body, { childList: true, subtree: true })
  // Deplete buffered mutations
  mutationHandler(observer.takeRecords())
  if (!newNodes.length)
    return

  newNodes.forEach(scanTextNodes)
  newNodes.length = 0
  translateTextNodes()

  // ruby hover 才显示
  _.querySelectorAll('ruby').forEach((ruby) => {
    const rt = ruby.querySelector('rt.katakana-terminator-rt')
    ruby.addEventListener('mouseover', () => {
      rt.style.visibility = 'visible'
    })
    ruby.addEventListener('mouseout', () => {
      rt.style.visibility = 'hidden'
    })
  })
}

function main() {
  console.debug('Katakana Terminator: started')
  GM_addStyle('rt.katakana-terminator-rt::before { content: attr(data-rt); }')

  GM_registerMenuCommand('Rescan', rescanTextNodes)
  GM_registerMenuCommand('Clear cache', () => {
    GM_setValue('cachedTranslations', {})
    cachedTranslations = {}
  })

  const timeoutId = setTimeout(() => {
    rescanTextNodes()
    clearTimeout(timeoutId)
  }, 5000)
}

// Polyfill for Greasemonkey 4
if (
  typeof GM_xmlhttpRequest === 'undefined'
  && typeof GM === 'object'
  && typeof GM.xmlHttpRequest === 'function'
)
  GM_xmlhttpRequest = GM.xmlHttpRequest

if (typeof GM_addStyle === 'undefined') {
  GM_addStyle = function (css) {
    const head = _.getElementsByTagName('head')[0]
    if (!head)
      return null

    const style = _.createElement('style')
    style.setAttribute('type', 'text/css')
    style.textContent = css
    head.appendChild(style)
    return style
  }
}

// Polyfill for ES5
if (typeof NodeList.prototype.forEach === 'undefined') {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window
    for (let i = 0; i < this.length; i++)
      callback.call(thisArg, this[i], i, this)
  }
}

main()
