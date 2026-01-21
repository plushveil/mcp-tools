#!/usr/bin/env node

import type { Workspace, JSONRPCRequest, JSONRPCResponse, JSONRPCHandler } from './types.d.ts'

import * as path from 'node:path'
import * as url from 'node:url'
import * as fs from 'node:fs'
import * as readline from 'node:readline'

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
  const workspace: Workspace = { pendingRequests: {}, logLevel: 'info' }
  const rl = readline.createInterface({ input, output })
  rl.on('line', (line) => onrequest(line, workspace))
  return rl
}

/**
 *
 */
async function onrequest (line: string, workspace: Workspace) : Promise<JSONRPCResponse | void> {
  const request = JSON.parse(line) as JSONRPCRequest

  const id = request.id as keyof typeof workspace.pendingRequests
  if (id && workspace.pendingRequests[id]) {
    const handler = workspace.pendingRequests[id]
    handler(request as JSONRPCResponse)
    delete workspace.pendingRequests[id]
    return
  }

  if (typeof request.method === 'string' && request.method in methods) {
    try {
      const method = methods[request.method]
      if (!method) {
        if (request.method.startsWith('notifications/')) return
        if (!request.id) return
        const response = { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } } as JSONRPCResponse
        return respond(response)
      }
      const response = await method(request, workspace)
      if (!response) return
      return respond(response)
    } catch (err) {
      const response = { jsonrpc: '2.0', id: request.id, error: { code: -32000, message: (err as Error).message } } as JSONRPCResponse
      return respond(response)
    }
  } else {
    const response = { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } } as JSONRPCResponse
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
