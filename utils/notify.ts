import type { JSONRPCNotification } from '../types.d.ts'

/**
 * Send a JSON-RPC notification.
 */
export default function notify (method: string, params?: Record<string, unknown>) : void {
  const request: JSONRPCNotification = { jsonrpc: '2.0', method, params }
  console.log(JSON.stringify(request))
}
