import type { Workspace, JSONRPCRequest, JSONRPCResponse } from '../../types.d.ts'

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
export default async function loggingSetLevel (request: JSONRPCRequest<LoggingSetLevelRequest>, workspace: Workspace) : Promise<JSONRPCResponse<{}>> {
  workspace.logLevel = (request.params?.level ?? 'info') as Workspace['logLevel']
  return { jsonrpc: '2.0', id: request.id!, result: {} }
}
