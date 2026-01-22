import type { JSONRPCRequest, JSONRPCResponse, PaginationRequest, PaginationResponse } from '../../src/types.d.ts'

import * as prompts from '../../src/prompts.ts'

type PromptsListRequest = {} & PaginationRequest

type PromptsListResponse = {
  prompts: Prompt[]
} & PaginationResponse

/**
 * A prompt definition includes:
 * name: Unique identifier for the prompt
 * description: Optional human-readable description
 * arguments: Optional list of arguments for customization
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#prompt
 */
export type Prompt = {
  name: string
  description?: string
  arguments?: Array<{
    name: string
    description: string
    required: boolean
  }>
}

/**
 * To retrieve available prompts, clients send a prompts/list request. This operation supports pagination.
 * @returns {Promise<JSONRPCResponse<PromptsListResponse>>} Array of prompt definitions
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#listing-prompts
 */
export default async function promptsList (request: JSONRPCRequest<PromptsListRequest>) : Promise<JSONRPCResponse<PromptsListResponse>> {
  const response: JSONRPCResponse<PromptsListResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      prompts: await prompts.listPrompts(),
    }
  }
  return response
}
