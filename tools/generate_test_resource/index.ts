import type sample from '../../utils/sampling.ts'
import type { ToolsCallResponse } from '../../methods/tools/call.ts'

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
 *
 */
export default async function generateTestResource (input: Input, ai: typeof sample) : Promise<ToolsCallResponse> {
  const outputFile = path.resolve(output, input.name)
  const uri = url.pathToFileURL(outputFile).toString()

  try {
    const response = await ai(
      { role: 'system', content: { type: 'text', text: 'You are a helpful assistant that generates test resource files based on user input.' } },
      { role: 'user', content: { type: 'text', text: `Get random content for a test resource. Like a poem, etc.` } },
    )
    if (response?.content?.type === 'text') input.content = response.content.text
  } catch (err) {
    input.content = `${(err as Error).stack}`
  }

  if (!fs.existsSync(path.dirname(outputFile))) fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, input.content, 'utf-8')

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
