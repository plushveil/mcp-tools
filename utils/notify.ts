import type { JSONRPCNotification } from '../types.d.ts'

import * as workspace from '../src/workspace.ts'

/**
 * Send a JSON-RPC notification.
 */
export default function notify (method: string, params?: Record<string, unknown>) : void {
  const request: JSONRPCNotification = { jsonrpc: '2.0', method, params }
  workspace.output(JSON.stringify(request))
}
