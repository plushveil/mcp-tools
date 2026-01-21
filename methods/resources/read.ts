import type { JSONRPCRequest, JSONRPCResponse } from '../../types.d.ts'

/**
 * 
 */
type ResourcesReadRequest = {
  uri: string,
}

/**
 * 
 */
type ResourcesReadResponse = {
  contents: ResourceContent[]
}

/**
 * Resources can contain either text or binary data.
 * blob must be base64-encoded when sent over the protocol.
 */
export type ResourceContent = TextContent | BinaryContent

type TextContent = {
  uri: string,
  mimeType: 'text/plain',
  text: string,
}

type BinaryContent = {
  uri: string,
  mimeType: string,
  blob: string,
}

/**
 * To retrieve resource contents, clients send a resources/read request
 * @returns {Promise<JSONRPCResponse<ResourcesReadResponse>>} Array of resource descriptors
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#reading-resources
 */
export default async function resourcesRead (request: JSONRPCRequest<ResourcesReadRequest>) : Promise<JSONRPCResponse<ResourcesReadResponse>> {
  const response: JSONRPCResponse<ResourcesReadResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      contents: [],
    }
  }
  return response
}
