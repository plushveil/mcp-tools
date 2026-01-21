#!/usr/bin/env node

import type { JSONRPCRequest, JSONRPCResponse, JSONRPCHandler } from './types.d.ts'

import * as path from 'node:path'
import * as url from 'node:url'
import * as fs from 'node:fs'
import * as readline from 'node:readline'

import output from './utils/console.ts'
import * as workspace from './src/workspace.ts'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const __methods = path.join(__dirname, 'methods')
const methods: Record<string, JSONRPCHandler> = {}
for (const f of fs.readdirSync(__methods, { recursive: true }).filter(f => f.toString().endsWith('.ts'))) {
  const name = f.toString().slice(0, -3)
  const method = (await import(url.pathToFileURL(path.join(__methods, f.toString())).toString())).default
  if (typeof method === 'function') methods[name] = method
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).toString()) {
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
    const response = { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } } as JSONRPCResponse
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
}

/**
 *
 */
function respond (response: JSONRPCResponse) : JSONRPCResponse {
  console.log(JSON.stringify(response))
  return response
}
