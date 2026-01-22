import type { JSONRPCRequest, JSONRPCResponse } from '../types.d.ts'
import * as workspace from '../src/workspace.ts'

let num = Number(Date.now())

/**
 * Send a JSON-RPC request and wait for the response.
 */
export default function ask <Result> (method: string, params?: Record<string, unknown>) : Promise<JSONRPCResponse<Result>> {
  return new Promise((resolve, reject) => {
    const id = (num++)
    workspace.waitForResponse(id, (response: JSONRPCResponse) => {
      if (response.error) {
        const err = new Error(response.error.message)
        return reject({ ...response.error, ...err })
      } else {
        resolve(response as JSONRPCResponse<Result>)
      }
    })
    const request: JSONRPCRequest = { jsonrpc: '2.0', method, id, params }
    workspace.output(JSON.stringify(request))
  })
}
