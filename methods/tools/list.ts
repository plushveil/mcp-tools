import type { JSONRPCRequest, JSONRPCResponse, PaginationRequest, PaginationResponse } from '../../src/types.d.ts'

import * as tools from '../../src/tools.ts'

/**
 *
 */
type ToolsListRequest = {} & PaginationRequest

/**
 *
 */
type ToolsListResponse = { tools: Tool[] } & PaginationResponse

/**
 *
 */
export type Tool = {
  name: string,
  description: string,
  inputSchema: {
    type: 'object',
    properties: Record<string, { type: 'string', description: string, format?: string }>,
    required: string[],
  }
}

/**
 * To discover available tools, clients send a tools/list request. This operation supports pagination.
 * @returns {Promise<JSONRPCResponse<ToolsListResponse>>} Array of tool definitions with schemas
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#listing-tools
 */
export default async function toolsList (request: JSONRPCRequest<ToolsListRequest>) : Promise<JSONRPCResponse<ToolsListResponse>> {
  const response: JSONRPCResponse<ToolsListResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      tools: tools.listToolDescriptors(),
    }
  }
  return response
}
