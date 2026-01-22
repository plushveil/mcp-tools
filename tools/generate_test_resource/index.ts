import type SampleType from '../../utils/sampling.ts'
import type AskType from '../../utils/ask.ts'
import type NotifyType from '../../utils/notify.ts'
import type ProgressType from '../../utils/progress.ts'
import type { ToolsCallResponse } from '../../methods/tools/call.ts'
import type { DropFirst } from '../../types.d.ts'

import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const output = path.resolve(__dirname, 'output')

/**
 * The input as defined in the package.json "inputSchema" field.
 */
type Input = {
  name: string,
  content: string,
}

/**
 * Available AI operations passed to the tool.
 */
type AiOperations = {
  progress: DropFirst<typeof ProgressType>
  notify: typeof NotifyType,
  ask: typeof AskType,
  sample: typeof SampleType,
}

/**
 *
 */
export default async function generateTestResource (input: Input, ai: AiOperations) : Promise<ToolsCallResponse> {
  const outputFile = path.resolve(output, input.name)
  const uri = url.pathToFileURL(outputFile).toString()

  try {
    const response = await ai.sample(
      { role: 'system', content: { type: 'text', text: 'You are a helpful assistant that generates test resource files based on user input.' } },
      { role: 'user', content: { type: 'text', text: `Get random content for a test resource. Like a poem, etc.` } },
    )
    if (response?.content?.type === 'text') input.content = response.content.text
  } catch (err) {
    input.content = `${(err as Error).stack}`
  }

  if (!fs.existsSync(path.dirname(outputFile))) fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, input.content, 'utf-8')

  for (let i = 0; i <= 100; i += 10) {
    ai.progress(i, `Generating resource "${input.name}": ${i}% complete`, 100)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return {
    content: [{ type: 'resource', resource: { uri, mimeType: 'text/plain', text: fs.readFileSync(outputFile, 'utf-8') } }],
    isError: false,
  }
}

/**
 *
 */
export async function getTextSuggestions (file: 'input' | 'test.prompt.md', key: string, input: string) : Promise<string[]> {
  if (file === 'test.prompt.md') return ['Just a random poem']
  return []
}
