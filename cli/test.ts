import * as qs from 'neoqs'
import {
  buildUrl,
  parseObjectQs,
  stringifyObjectQs,
} from '~/utils/url'

const query2 = {
  data: {
    name: 'hello',
    key: true,
  },
  message: 'ok',
}
const query3 = `data=${JSON.stringify({ name: 'hello', arr: [{ key: 'valie' }, { key: '233' }] })}&array=${JSON.stringify([{ key: 'valie' }, { key: ['233'] }])}`

console.log(
  stringifyObjectQs(query2),
  '\n',
  qs.stringify(query2, {

  }),
  '\n',
  JSON.stringify(parseObjectQs(query3), null, 2),
  '\n',
  qs.parse(query3, {

  }),
  buildUrl({
    uri: 'https://www.baidu.com/s',
    query: {
      wd: 'hello',
      name: 'hello',
      json: {
        key: 'value',
        arr: [1, 2, 3],
      },
    },
    hash: 'hash',
  }),
)
