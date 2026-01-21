import type { Workspace, JSONRPCRequest, JSONRPCResponse } from '../types.d.ts'

let num = Number(Date.now())

/**
 * Send a JSON-RPC request and wait for the response.
 */
export default function ask <Result> (workspace: Workspace, method: string, params?: Record<string, unknown>) : Promise<JSONRPCResponse<Result>> {
  const id = (num++)
  return new Promise((resolve, reject) => {
    workspace.pendingRequests[id] = (response: JSONRPCResponse) => {
      if (response.error) {
        const err = new Error(response.error.message)
        return reject({ ...response.error, ...err })
      } else {
        resolve(response as JSONRPCResponse<Result>)
      }
    }
    const request: JSONRPCRequest = { jsonrpc: '2.0', method, id, params }
    console.log(JSON.stringify(request))
  })
}
