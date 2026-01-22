import type { JSONRPCRequest, JSONRPCResponse, MetaInformation } from '../../types.d.ts'
import type { ResourceContent } from '../resources/read.ts'

import * as tools from '../../src/tools.ts'

/**
 *
 */
type ToolsCallRequest = {
  name: string,
  arguments: Record<string, string>,
  _meta?: MetaInformation
}

/**
 *
 */
export type ToolsCallResponse = { content: ToolResult[], isError: boolean }

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
  if (!request.params || !request.params.name) {
    const response: JSONRPCResponse<ToolsCallResponse> = {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        content: [{
          type: 'text',
          text: 'Tool name is required.'
        }],
        isError: true,
      }
    }
    return response
  }


  const response: JSONRPCResponse<ToolsCallResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: await tools.callTool(request.params.name, request.params.arguments || {}, request.params._meta)
  }
  return response
}
