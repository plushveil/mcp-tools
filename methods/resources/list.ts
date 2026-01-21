import type { JSONRPCRequest, JSONRPCResponse, PaginationRequest, PaginationResponse } from '../../types.d.ts'

import * as resources from '../../src/resources.ts'

/**
 * 
 */
type ResourceListRequest = {} & PaginationRequest

/**
 * 
 */
type ResourceListResponse = { resources: Resource[] } & PaginationResponse

/**
 * A resource definition includes:
 * uri: Unique identifier for the resource
 * name: Human-readable name
 * description: Optional description
 * mimeType: Optional MIME type
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#resource
 */
export type Resource = {
  uri: string,
  name: string,
  description?: string,
  mimeType?: string
}

/**
 * List available direct resources
 * @returns {Promise<JSONRPCResponse<ResourceListResponse>>} Array of resource descriptors
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#listing-resources
 */
export default async function resourcesList (request: JSONRPCRequest<ResourceListRequest>) : Promise<JSONRPCResponse<ResourceListResponse>> {
  const response: JSONRPCResponse<ResourceListResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      resources: resources.getResources(),
    }
  }
  return response
}
