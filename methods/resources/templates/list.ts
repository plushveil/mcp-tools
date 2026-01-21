import type { JSONRPCRequest, JSONRPCResponse } from '../../../types.d.ts'

/**
 *
 */
type ResourcesTemplatesListRequest = {}

/**
 *
 */
type ResourcesTemplatesListResponse = {
  resourceTemplates: ResourceTemplateDescriptor[]
}

/**
 *
 */
type ResourceTemplateDescriptor = {
  uriTemplate: string,
  name: string,
  description: string,
  mimeType: string
}

/**
 * Resource templates allow servers to expose parameterized resources using URI templates.
 * Arguments may be auto-completed through the completion API.
 * @returns {Promise<JSONRPCResponse<ResourcesTemplatesListResponse>>} Array of resource descriptors
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#resource-templates
 * @see https://datatracker.ietf.org/doc/html/rfc6570
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/
 */
export default async function resourcesTemplatesList (request: JSONRPCRequest<ResourcesTemplatesListRequest>) : Promise<JSONRPCResponse<ResourcesTemplatesListResponse>> {
  const response: JSONRPCResponse<ResourcesTemplatesListResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      resourceTemplates: [
      ],
    }
  }
  return response
}
