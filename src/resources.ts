import type { Resource } from '../methods/resources/list.ts'
import type { ResourceContent } from '../methods/resources/read.ts'

import * as url from 'node:url'
import * as path from 'node:path'
import * as fs from 'node:fs'

import notify from '../utils/notify.ts'

const watchers: fs.FSWatcher[] = []
const resources: Record<string, Resource> = {}

/**
 *
 */
export async function onToolListChanged (tools: string[]) : Promise<void> {
  while (watchers.length > 0) watchers.pop()?.close()

  const updatedResources: Record<string, Resource> = {}
  for (const tool of tools) {
    const output = path.resolve(url.fileURLToPath(tool), 'output')
    if (!fs.existsSync(output)) {
      const parent = path.dirname(output)
      if (!fs.existsSync(parent)) continue
      console.debug('resources.ts:25', watchers.length)
      watchers.push(fs.watch(parent, { persistent: false, recursive: false }, (_eventType, filename) => {
        if (filename !== 'output') return
        try { onToolListChanged(tools) } catch {}
      }))
      continue
    }
    console.debug('resources.ts:32', watchers.length)
    watchers.push(fs.watch(output, { persistent: false, recursive: false }, (_eventType, filename) => {
      if (!filename) return
      const resource = getResourceFromFilePath(path.resolve(output, filename))
      if (!resource || !hasChanged(resource)) return
      resources[resource.uri] = resource
      notify('notifications/resources/list_changed')
    }))

    for (const dirent of fs.readdirSync(output, { withFileTypes: true, recursive: true })) {
      if (!dirent.isFile()) continue
      const resource = getResourceFromFilePath(path.resolve(output, dirent.name))
      if (!resource) continue
      updatedResources[resource.uri] = resource
    }
  }

  const changed = (() : boolean => {
    if (Object.keys(resources).length !== Object.keys(updatedResources).length) return true
    for (const resource of Object.values(resources)) if (hasChanged(resource)) return true
    return false
  })()
  
  if (changed) {
    for (const key of Object.keys(resources)) delete resources[key]
    Object.assign(resources, updatedResources)
    notify('notifications/resources/list_changed')
  }
}

/**
 *
 */
export function getResources () : Resource[] {
  return Object.values(resources)
}

/**
 *
 */
export function readResource (uri: string) : ResourceContent[] | void {
  const resource = resources[uri]
  if (!resource) return

  const filePath = url.fileURLToPath(uri)
  if (!fs.existsSync(filePath)) return

  const stats = fs.statSync(filePath)
  if (stats.size > 10 * 1024 * 1024) {
    return [{
      uri: resource.uri,
      mimeType: 'application/octet-stream',
      blob: '',
    }]
  }

  if (resource.uri.endsWith('.txt')) {
    return [{
      uri: resource.uri,
      mimeType: 'text/plain',
      text: fs.readFileSync(filePath, 'utf-8'),
    }]
  }

  return [{
    uri: resource.uri,
    mimeType: 'application/octet-stream',
    blob: fs.readFileSync(filePath).toString('base64'),
  }]
}

/**
 *
 */
function getResourceFromFilePath (filePath: string) : Resource | null {
  const uri = url.pathToFileURL(filePath).toString()
  if (!fs.existsSync(filePath)) return null
  const stats = fs.statSync(filePath)
  return {
    uri,
    name: path.basename(filePath),
    description: `Size: ${stats.size} bytes, Modified: ${stats.mtime.toISOString()}`,
    mimeType: 'application/octet-stream',
  }
}

/**
 *
 */
function hasChanged (resource: Resource) : boolean {
  const existing = resources[resource.uri]
  if (!existing) return true
  if (existing.name !== resource.name) return true
  if (existing.description !== resource.description) return true
  if (existing.mimeType !== resource.mimeType) return true
  return false
}
