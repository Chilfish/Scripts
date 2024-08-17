import { writeFile } from 'node:fs/promises'
import { dir, readJson } from '~/utils/file'

const data = await readJson('data/twitter/text.json').then(r => r) as {
  id: string
  text: string
  created_at: string
}[]

const prefixMd = `# Twitter data

`

const md = data
  .sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
  .map(({ text, created_at }) => {
    if (text.startsWith('@')) {
      text = `Reply to ${text}`
    }

    return `### ${created_at} GMT+0800
  
${text}
`
  })

await writeFile(dir('data/twitter/text.md'), prefixMd + md.join('\n'))
