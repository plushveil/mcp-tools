import type { JSONRPCNotification, JSONRPCResponse } from '../../src/types.d.ts'

import * as url from 'node:url'
import ask from '../../utils/ask.ts'
import * as workspace from '../../src/workspace.ts'

/**
 * This notification is received when the language server has been initialized.
 */
export default async function notificationsInitialized (request: JSONRPCNotification) : Promise<JSONRPCResponse | void> {
  let roots = (await ask<{ roots: { uri: string, name: string }[] }>('roots/list')).result!.roots
  if (!roots || roots.length === 0) roots = [{ uri: url.pathToFileURL(process.cwd()).href, name: 'cwd' }]
  workspace.setRootDirectories(roots)
}
