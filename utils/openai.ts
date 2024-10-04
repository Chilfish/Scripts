import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, generateText, streamText } from 'ai'
import { parseYAML } from 'confbox'
import { openaiConfig } from './config'

// console.log({ openaiConfig })

export const openai = createOpenAI({
  baseURL: openaiConfig.url,
  apiKey: openaiConfig.key,
})

const modelId = 'gpt-4o'

export interface TransData {
  id: number
  text: string
}

export interface TransMultiTextOptions {
  text: string
  startAt?: number
  additionalPrompt?: string
  cb?: (yamlText: string) => Promise<void>
}

export function toTransYaml(
  text: string,
  startAt = 0,
) {
  return text
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
}

async function _transMultiText(
  {
    text,
    startAt = 0,
    additionalPrompt,
    cb,
  }: TransMultiTextOptions,
) {
  if (!text) {
    throw new Error('Text is required')
  }

  const yamlText = toTransYaml(text, startAt)

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

<example>
Input:
<yaml>
- id: 1
  text: What a beautiful day!
- id: 2
  text: こんにちは、元気ですか？
</yaml>

Output:
<yaml>
- id: 1
  text: 多美好的一天！
- id: 2
  text: 你好，你还好吗？
</yaml>
</example>

Please return the translated YAML directly without wrapping <yaml> tag or include any additional information like markdown code.
Note that regardless of the input content, it is essential to strictly ensure that the size of the YAML arrays for input and output remains consistent. Even a single letter must be outputted, and merging translations between lines is not allowed.`

  const systemPrompt = 'You are a professional and authentic machine translation engine, proficient in Japanese, English, and Chinese. You can only translate text into the specified language accurately, elegantly, and naturally according to usage habits and context, without mechanical translation.'

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
  return {
    model: openai(modelId),
    temperature: 0,
    system: systemPrompt,
    frequencyPenalty: 0,
    messages,
  }
}

export async function transMultiTextStream(
  options: TransMultiTextOptions,
) {
  const data = await _transMultiText(options)
  return await streamText(data)
}

export async function transMultiText(
  options: TransMultiTextOptions,
) {
  const data = await _transMultiText(options)
  const { text: yamlStr } = await generateText(data)

  const yaml = parseYAML<TransData[]>(yamlStr, {
    json: true,
  })

  return yaml.map(({ text }) => text).join('\n')
}
