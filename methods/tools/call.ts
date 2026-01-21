import type { JSONRPCRequest, JSONRPCResponse } from '../../types.d.ts'
import type { ResourceContent } from '../resources/read.ts'

/**
 *
 */
type ToolsCallRequest = {}

/**
 *
 */
type ToolsCallResponse = { content: ToolResult[], isError: boolean }

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#tool-result
 */
type ToolResult = TextContent | ImageContent | EmbeddedResource

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#text-content
 */
type TextContent = {
  type: 'text',
  text: string,
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#image-content
 */
type ImageContent = {
  type: 'image',
  data: string,
  mimeType: string,
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#embedded-resource-content
 */
type EmbeddedResource = {
  type: 'resource',
  resource: ResourceContent
}

/**
 * To invoke a tool, clients send a tools/call request:
 * @returns {Promise<JSONRPCResponse<ToolsCallResponse>>} A list of content pieces resulting from the tool invocation
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#listing-tools
 */
export default async function toolsCall (request: JSONRPCRequest<ToolsCallRequest>) : Promise<JSONRPCResponse<ToolsCallResponse>> {
  const response: JSONRPCResponse<ToolsCallResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      content: [
      ],
      isError: false,
    }
  }
  return response
}
