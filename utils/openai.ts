import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { openaiKey } from './config'

export const openai = createOpenAI({
  baseURL: 'https://aigcapi.io/v1',
  apiKey: openaiKey,
})

export const gpt4omini = openai('gpt-4o-mini')

const modelId = 'gpt-4o-mini'

export async function transMultiText(
  text: string,
  startAt = 0,
  cb?: (yamlText: string) => Promise<void>,
) {
  if (!text) {
    throw new Error('Text is required')
  }

  const yamlText = text
    .trim()
    .split('\n')
    .map((line, index) => {
      if (!line.trim()) {
        return null
      }
      return `- id: ${index + 1 + startAt}\n  {{source}}: ${line}`
    })
    .filter(Boolean) as string[]

  if (cb)
    await cb(yamlText.join('\n'))

  const target = 'zh-Hans'
  const userPrompt = `Translate the following source text to ${target}, Output translation directly without any additional text.
Source Text: ${yamlText.join('\n')}
Translated Text:`

  const prompt = `
You will be given a YAML formatted input containing entries with "id" and "source" fields. Here is the input:

<yaml>
{{yaml}}
</yaml>

For each entry in the YAML, translate the contents of the "source" field into ${target}. Write the translation back into the "trans" field for that entry.

Here is an example of the expected format:

<example>
Input:
- id: 1
  source: Source
Output:
- id: 1
  trans: Translation
</example>

Please return the translated YAML directly without wrapping <yaml> tag or include any additional information.
  `
  const systemPrompt = 'You are a professional, authentic machine translation engine.'

  return streamText({
    model: openai(modelId),
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  })
}
