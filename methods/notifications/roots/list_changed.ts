import type { JSONRPCNotification, JSONRPCResponse } from '../../../src/types.d.ts'

import * as url from 'node:url'

import * as workspace from '../../../src/workspace.ts'
import ask from '../../../utils/ask.ts'

/**
 * This notification is received when the list of root directories has changed.
 */
export default async function notificationsRootsListChanged (request: JSONRPCNotification) : Promise<JSONRPCResponse | void> {
  let roots = (await ask<{ roots: { uri: string, name: string }[] }>('roots/list')).result!.roots
  if (!roots || roots.length === 0) roots = [{ uri: url.pathToFileURL(process.cwd()).href, name: 'cwd' }]

  const rootDirectories = workspace.getRootDirectories().map(root => root.uri)
  const newRootDirectories = roots.map(root => root.uri)

  const areDifferent = rootDirectories.length !== newRootDirectories.length ||
    rootDirectories.some((root, index) => root !== newRootDirectories[index])

  if (areDifferent) {
    workspace.setRootDirectories(roots)
  }
}
