import type sample from '../../utils/sampling.ts'
import type { ToolsCallResponse } from '../../methods/tools/call.ts'

/**
 * The input as defined in the package.json "inputSchema" field.
 */
type Input = {
  tool: string,
  command: string,
  args?: string[],
}

/**
 *
 */
export default async function updateToolStartCommand (input: Input, ai: typeof sample) : Promise<ToolsCallResponse> {
  const args = input.args || []
  const command = [input.command, ...args].join(' ')
  return {
    content: [{
      type: 'text',
      text: `Tool "${input.tool}" will be started with command: ${command}`
    }],
    isError: false,
  }
}
