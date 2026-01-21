import type { JSONRPCNotification, JSONRPCResponse } from '../../types.d.ts'

import * as url from 'node:url'
import ask from '../../utils/ask.ts'
import * as workspace from '../../src/workspace.ts'

/**
 *
 */
export default async function notificationsInitialized (request: JSONRPCNotification) : Promise<JSONRPCResponse | void> {
  let roots = (await ask<{ roots: { uri: string, name: string }[] }>('roots/list')).result!.roots
  if (roots.length === 0) roots = [{ uri: url.pathToFileURL(process.cwd()).href, name: 'cwd' }]
  workspace.setRootDirectories(roots)
}
