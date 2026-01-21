import type { JSONRPCResponse } from '../types.d.ts'

import console from '../utils/console.ts'
import * as prompts from './prompts.ts'
import * as resouces from './resources.ts'
import * as tools from './tools.ts'

const internalState: InternalState = {
  logLevel: 'info',
  pendingResponses: {},
  rootDirectories: []
}

/**
 *
 */
type InternalState = {
  logLevel: LogLevel
  pendingResponses: Record<string | number, (response: JSONRPCResponse) => void>
  rootDirectories: RootDirectory[]
}

/**
 *
 */
type RootDirectory = { uri: string, name: string }

/**
 *
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 *
 */
type ResponseCallback = (response: JSONRPCResponse) => void

/**
 *
 */
export function getRootDirectories(): RootDirectory[] {
  return internalState.rootDirectories
}

/**
 *
 */
export function setRootDirectories(roots: RootDirectory[]): void {
  internalState.rootDirectories = roots
  console.info(`Root directories set to:\n - ${roots.map(root => root.uri).join('\n - ')}`)

  tools.onWorkspaceRootsListChanged()
  resouces.onWorkspaceRootsListChanged()
  prompts.onWorkspaceRootsListChanged()
}

/**
 *
 */
export function setLogLevel(level: LogLevel): void {
  internalState.logLevel = level
}

/**
 *
 */
export function getLogLevel(): LogLevel {
  return internalState.logLevel
}

/**
 *
 */
export function waitForResponse (id: string | number, callback: ResponseCallback): void {
  internalState.pendingResponses[id] = callback
}

/**
 * Retrieves and removes the response callback for the given ID.
 */
export function getResponseForId (id: string | number): ResponseCallback | undefined {
  const callback = internalState.pendingResponses[id]
  if (callback) {
    return (...args) => {
      delete internalState.pendingResponses[id]
      return callback(...args)
    }
  }
  return undefined
}
