import type { JSONRPCRequest, JSONRPCResponse } from '../../src/types.d.ts'

import * as workspace from '../../src/workspace.ts'

/**
 *
 */
type LoggingSetLevelRequest = {
  level: string
}

/**
 * To configure the minimum log level, clients MAY send a logging/setLevel request
 * @returns {Promise<JSONRPCResponse<{}>>}
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#getting-a-prompt
 */
export default async function loggingSetLevel (request: JSONRPCRequest<LoggingSetLevelRequest>) : Promise<JSONRPCResponse<{}>> {
  const logLevel = (request.params?.level ?? 'info')
  if (logLevel !== workspace.getLogLevel()) workspace.setLogLevel(logLevel as any)
  return { jsonrpc: '2.0', id: request.id!, result: {} }
}
