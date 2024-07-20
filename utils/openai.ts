import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'
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
  additionalPrompt?: string,
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
      return `- id: ${index + 1 + startAt}\n  text: ${line}`
    })
    .filter(Boolean)
    .join('\n')

  if (cb)
    await cb(yamlText)

  const target = 'Simplified Chinese'

  const prompt = `You will be given a YAML formatted input containing entries with "id" and "text" fields. Here is the input:
<yaml>
${yamlText}
</yaml>


For each entry in the YAML, translate the contents of the "text" field into ${target}.
Write the translation back into the "text" field for that entry and keep the "id" field unchanged.
Here is an example of the expected format

Input:
<yaml>
- id: 1
  text: What a beautiful day!
- id: 2
  text: こんにちは、元気ですか？
</yaml>

Output:
- id: 1
  text: 多美好的一天！
- id: 2
  text: 你好，你还好吗？

Please return the translated YAML directly without wrapping <yaml> tag or include any additional information like markdown code.
Note that regardless of the input content, it is essential to strictly ensure that the size of the YAML arrays for input and output remains consistent. Even a single letter must be outputted, and merging translations between lines is not allowed.

  `
  const systemPrompt = '您是专业、正宗的机器翻译引擎，精通日语，英语和中文，您只能按用语习惯、语境来信达雅地、不机翻而生动地翻译文本到指定的语言。'

  const messages = [
    {
      role: 'user',
      content: prompt,
    },
  ] satisfies CoreMessage[]

  if (additionalPrompt) {
    messages.push({
      role: 'user',
      content: additionalPrompt,
    })
  }

  return streamText({
    model: openai(modelId),
    temperature: 0,
    system: systemPrompt,
    frequencyPenalty: 0,
    messages,
  })
}
