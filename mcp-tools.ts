#!/usr/bin/env node

import type { JSONRPCRequest, JSONRPCResponse, JSONRPCHandler } from './src/types.d.ts'

import * as path from 'node:path'
import * as url from 'node:url'
import * as fs from 'node:fs'
import * as readline from 'node:readline'

import output from './utils/console.ts'
import * as workspace from './src/workspace.ts'

// methods
import methodInitialize from './methods/initialize.ts'
import methodCompletionComplete from './methods/completion/complete.ts'
import methodLoggingSetLevel from './methods/logging/setLevel.ts'
import methodNotificationsInitialized from './methods/notifications/initialized.ts'
import methodNotificationsListChanged from './methods/notifications/roots/list_changed.ts'
import methodPromptsGet from './methods/prompts/get.ts'
import methodPromptsList from './methods/prompts/list.ts'
import methodResourcesList from './methods/resources/list.ts'
import methodResourcesRead from './methods/resources/read.ts'
import methodResourcesSubscribe from './methods/resources/subscribe.ts'
import methodResourcesTemplatesList from './methods/resources/templates/list.ts'
import methodToolsCall from './methods/tools/call.ts'
import methodTools from './methods/tools/list.ts'

const __filename = fs.realpathSync(url.fileURLToPath(import.meta.url))
const __dirname = path.dirname(__filename)

const methods: Record<string, JSONRPCHandler> = {
  'initialize': methodInitialize,
  'completion/complete': methodCompletionComplete,
  'logging/setLevel': methodLoggingSetLevel,
  'notifications/initialized': methodNotificationsInitialized,
  'notifications/roots/list_changed': methodNotificationsListChanged,
  'prompts/get': methodPromptsGet,
  'prompts/list': methodPromptsList,
  'resources/list': methodResourcesList,
  'resources/read': methodResourcesRead,
  'resources/subscribe': methodResourcesSubscribe,
  'resources/templates/list': methodResourcesTemplatesList,
  'tools/call': methodToolsCall,
  'tools/list': methodTools,
}

// for dynamic method loading, may not work in packaged environments
const __methods = path.join(__dirname, 'methods')
if (fs.existsSync(__methods)) {
  for (const f of fs.readdirSync(__methods, { recursive: true }).filter(f => f.toString().endsWith('.ts'))) {
    const name = f.toString().slice(0, -3)
    const method = (await import(url.pathToFileURL(path.join(__methods, f.toString())).toString())).default
    if (typeof method === 'function') methods[name] = method
  }
}

if (fs.realpathSync(url.fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
  await main()
}

/**
 *
 */
export async function main (input: NodeJS.ReadableStream = process.stdin, output: NodeJS.WritableStream = process.stdout) : Promise<readline.Interface> {
  const rl = readline.createInterface({ input, output })
  rl.on('line', (line) => onrequest(line))
  return rl
}

/**
 *
 */
async function onrequest (line: string) : Promise<JSONRPCResponse | void> {
  try {
    const request = JSON.parse(line) as JSONRPCRequest

    const id = request.id
    if (id && workspace.getResponseForId(id!)) {
      const handler = workspace.getResponseForId(id)!
      handler(request as JSONRPCResponse)
      return
    }

    if (!(typeof request.method === 'string' && request.method in methods)) {
      if (!request.id || request.method.startsWith('notifications/')) {
        output.debug`Ignoring notification for unhandled method: "${request.method}"`
        return
      }
      const response = { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: `Method "${request.method}" not found` } } as JSONRPCResponse
      return respond(response)
    }

    try {
      const method = methods[request.method]
      const response = await method(request)
      if (!response) return
      return respond(response)
    } catch (err) {
      const response = { jsonrpc: '2.0', id: request.id, error: { code: -32000, message: (err as Error).message } } as JSONRPCResponse
      return respond(response)
    }
  } catch (err) {
    const e = err as Error
    output.error(e.stack || e.toString())
  }
}

/**
 *
 */
function respond (response: JSONRPCResponse) : JSONRPCResponse {
  workspace.output(JSON.stringify(response))
  return response
}
