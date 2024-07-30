// dom in nodejs

import { Window } from 'happy-dom'

const window = new Window()
const document = window.document

export function $<T = HTMLElement>(
  rootHTML: string,
  selector: string,
) {
  document.body.innerHTML = rootHTML
  return document.querySelector(selector) as T | null
}

export function $$<T = HTMLElement>(
  rootHTML: string,
  selector: string,
) {
  document.body.innerHTML = rootHTML
  return Array.from(document.querySelectorAll(selector)) as T[]
}
