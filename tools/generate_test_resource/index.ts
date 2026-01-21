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

  // example
  if (!fs.existsSync(path.dirname(outputFile))) fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, input.content, 'utf-8')

  return {
    content: [{ type: 'resource', resource: { uri, mimeType: 'text/plain', text: '' } }],
    isError: false,
  }
}

/**
 *
 */
export async function getTextSuggestions (file: 'input' | 'test.prompt.md', key: string, input: string) : Promise<string[]> {
  return []
}
