import type { JSONRPCRequest, JSONRPCResponse } from '../../types.d.ts'

import * as fs from 'node:fs'
import * as url from 'node:url'

import notify from '../../utils/notify.ts'

/**
 *
 */
type ResourcesSubscribeRequest = {
  uri: string,
}

/**
 * The protocol supports optional subscriptions to resource changes.
 * Clients can subscribe to specific resources and receive notifications when they change.
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#subscriptions
 */
export default async function resourcesSubscribe (request: JSONRPCRequest<ResourcesSubscribeRequest>) : Promise<JSONRPCResponse> {
  if (!request.params || !request.params.uri) {
    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32602,
        message: 'Invalid params: "uri" is required',
      }
    }
    return response
  }

  const file = url.fileURLToPath(request.params.uri)
  if (!fs.existsSync(file)) {
    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32004,
        message: `Resource not found: ${request.params.uri}`,
      }
    }
    return response
  }

  fs.watch(file, { persistent: false, recursive: false }, () => { notify('notifications/resources/changed', { uri: request.params!.uri }) })
  notify('notifications/resources/subscribe', { uri: request.params.uri })
  
  const response: JSONRPCResponse = { jsonrpc: '2.0', id: request.id, result: {}, }
  return response
}
