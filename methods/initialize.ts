import type { JSONRPCRequest, JSONRPCResponse } from '../types.d.ts'

import console from '../utils/console.ts'

/**
 *
 */
export default async function initialize (request: JSONRPCRequest) : Promise<JSONRPCResponse> {
  console.debug('Initializing workspace')
  const response: JSONRPCResponse = {
    jsonrpc: '2.0',
    id: request.id!,
    result: {
      // https://modelcontextprotocol.info/specification/2024-11-05/server/
      capabilities: {

        // https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#capabilities
        resources: {
          // whether the client can subscribe to be notified of changes to individual resources.
          subscribe: true,
          // whether the server will emit notifications when the list of available resources changes.
          listChanged: true
        },

        // https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#capabilities
        prompts: {
          // listChanged indicates whether the server will emit notifications when the list of available prompts changes.
          listChanged: true
        },

        // https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#capabilities
        tools: {
          // listChanged indicates whether the server will emit notifications when the list of available tools changes.
          listChanged: true
        },

        // https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/logging/#capabilities
        logging: {
        }
      },
    }
  }

  return response
}
