import type { JSONRPCRequest, JSONRPCResponse } from '../../src/types.d.ts'

import * as url from 'node:url'
import * as path from 'node:path'
import * as fs from 'node:fs'

import * as prompts from '../../src/prompts.ts'
import * as tools from '../../src/tools.ts'

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/#completerequest
 */
type CompletionCompleteRequest= {
  ref: PromptReference | ResourceReference,
  argument: {
    name: string,
    value: string,
  }
}


type CompletionCompleteResponse = {
  completion: CompleteResult,
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/#reference-types
 */
type PromptReference = {
  type: 'ref/prompt',
  name: string,
}

type ResourceReference = {
  type: 'ref/resource',
  uri: string,
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/#completion-results
 */
type CompleteResult = {
  values: string[],
  total?: number,
  hasMore: boolean,
}

/**
 *
 */
export default async function completionComplete (request: JSONRPCRequest<CompletionCompleteRequest>) : Promise<JSONRPCResponse<CompletionCompleteResponse>> {
  const empty: JSONRPCResponse<CompletionCompleteResponse> = { jsonrpc: '2.0', id: request.id, result: { completion: { values: [], hasMore: false } } }
  if (!request.params) return empty
  if (request.params.ref.type === 'ref/resource') return getResourceCompletions(request, empty)
  if (request.params.ref.type === 'ref/prompt') return getPromptCompletions(request, empty)
  return empty
}

/**
 *
 */
async function getResourceCompletions (request: JSONRPCRequest<CompletionCompleteRequest>, empty: JSONRPCResponse<CompletionCompleteResponse>) : Promise<JSONRPCResponse<CompletionCompleteResponse>> {
  return empty
}

/**
 *
 */
async function getPromptCompletions (request: JSONRPCRequest<CompletionCompleteRequest>, empty: JSONRPCResponse<CompletionCompleteResponse>) : Promise<JSONRPCResponse<CompletionCompleteResponse>> {
  if (request?.params?.ref?.type !== 'ref/prompt') return empty
  const prompt = await prompts.findPromptByName(request.params.ref.name)
  if (!prompt) return empty

  const toolPackage = tools.findToolByUri(url.pathToFileURL(prompt.tool).toString())
  if (!toolPackage) return empty
  if (!toolPackage.main) return empty

  const main = fs.existsSync(path.join(prompt.tool, toolPackage.main)) && url.pathToFileURL(path.join(prompt.tool, toolPackage.main)).toString()
  if (!main) return empty

  let suggestions: string[] = []
  try {
    const module = await import(main)
    if (typeof module.getTextSuggestions === 'function') {
      const file = path.relative(prompt.tool, prompt.file)
      const response = await module.getTextSuggestions(file, request.params.argument.name, request.params.argument.value)
      if (typeof response === 'object' && response && typeof response.hasMore === 'boolean' && Array.isArray(response.values)) {
        const r: JSONRPCResponse<CompletionCompleteResponse> = { jsonrpc: '2.0', id: request.id, result: { completion: response } }
        return r
      }
      if (typeof response === 'string') suggestions = [response]
      else suggestions = response
    }
  } catch (err) {
    return empty
  }

  const response: JSONRPCResponse<CompletionCompleteResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      completion: {
        values: suggestions,
        hasMore: false,
      }
    }
  }
  return response
}
