import type { MetaInformation } from '../src/types.d.ts'
import type { Tool } from '../methods/tools/list.ts'
import type { ToolCallResponse } from '../methods/tools/call.ts'
import type { AiOperations } from '../types.d.ts'

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'
import * as cmd from 'node:child_process'

import * as resources from './resources.ts'
import * as prompts from './prompts.ts'
import * as workspace from './workspace.ts'

import ask from '../utils/ask.ts'
import notify from '../utils/notify.ts'
import sample from '../utils/sampling.ts'
import console from '../utils/console.ts'
import unboundProgress from '../utils/progress.ts'

let sideEffects = false

type ToolPackageJSON = {
  main?: string,
} & Tool

const allToolsFolders = ['tools']
const watchers: fs.FSWatcher[] = []
const tools: Record<string, ToolPackageJSON> = {}

/**
 *
 */
export async function onWorkspaceRootsListChanged () : Promise<void> {
  await onToolFolderChange()
}

/**
 *
 */
export function findToolByUri (uri: string) : ToolPackageJSON {
  return tools[uri]
}

/**
 *
 */
export function listToolDescriptors () : Tool[] {
  return Object.values(tools).map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }))
}

/**
 *
 */
export async function callTool (name: string, input: Record<string, string>, _meta?: MetaInformation) : Promise<ToolCallResponse> {
  const [root, tool] = Object.entries(tools).find(([key, t]) => t.name === name) ?? [null, null]
  if (!tool) {
    return {
      content: [{
        type: 'text',
        text: `Tool "${name}" not found.`
      }],
      isError: true,
    }
  }

  if (!tool.main) {
    return {
      content: [{
        type: 'text',
        text: `Tool "${name}" has no main entry point defined.`
      }],
      isError: true,
    }
  }

  try {
    const rootPath = url.fileURLToPath(root)
    const main = url.pathToFileURL(path.join(rootPath, tool.main)).href
    const toolModule = await import(main)
    if (typeof toolModule.default !== 'function') {
      return {
        content: [{
          type: 'text',
          text: `Failed to load main module "${name}": default export is not a function.\n    in ${url.pathToFileURL(main)}`
        }],
        isError: true,
      }
    }

    sideEffectsBeforeFirstToolCall()
    const progress = _meta?.progressToken ? unboundProgress.bind(null, _meta.progressToken) : () => {}
    const nodeModulesPath = path.join(rootPath, 'node_modules')
    if (!fs.existsSync(nodeModulesPath)) {
      await installDependencies(rootPath, progress)
      progress(0, `Starting to execute "${name}"...`)
    }

    let result = await toolModule.default(input, { progress, notify, ask, sample })
    if (typeof result !== 'object' || !result) result = {}
    return {
      content: Array.isArray(result.content) ? result.content : [],
      isError: typeof result.isError === 'boolean' ? result.isError : false,
    }
  } catch (err) {
    console.error((err as Error).stack ?? (err as Error).toString())
    return {
      content: [{
        type: 'text',
        text: `Failed to load main module for tool "${name}": ${(err as Error).message}`
      }],
      isError: true,
    }
  }
}

/**
 *
 */
function sideEffectsBeforeFirstToolCall () : void {
  if (sideEffects) return
  sideEffects = true

  // @ts-expect-error -- IGNORE --
  global.console = console
}

/**
 *
 */
async function onToolFolderChange () : Promise<void> {
  const roots = workspace.getRootDirectories()
  while (watchers.length > 0) watchers.pop()?.close()

  const updatedTools: Record<string, Tool> = {}
  for (const root of roots) {
    let watchParent = false
    for (const toolsFolder of allToolsFolders) {
      const fullPath = path.join(url.fileURLToPath(root.uri), toolsFolder)
      if (!(fs.existsSync(fullPath))) { watchParent = true; continue }
      Object.assign(updatedTools, await getAvailableTools(fullPath))
      watchers.push(fs.watch(fullPath, { persistent: false, recursive: false }, (eventType, filename) => {
        if (!filename) return
        onToolFolderChange()
      }))
    }

    if (watchParent) {
      const interval = setInterval(() => {
        for (const toolsFolder of allToolsFolders) {
          const fullPath = path.join(url.fileURLToPath(root.uri), toolsFolder)
          if (fs.existsSync(fullPath)) {
            clearInterval(interval)
            onToolFolderChange()
            break
          }
        }
      }, 10000).unref()
      watchers.push({ close: () => { clearInterval(interval) } } as fs.FSWatcher)
    }
  }

  updateTools(updatedTools)
}

/**
 *
 */
async function getAvailableTools(folder: string) : Promise<Record<string, Tool>> {
  const updatedTools: Record<string, Tool> = {}
  for (const dirent of fs.readdirSync(folder, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue
    const toolPath = path.join(folder, dirent.name)
    const toolConfigPath = path.join(toolPath, 'package.json')
    if (!fs.existsSync(toolConfigPath)) {
      const interval = setInterval(() => {
        if (fs.existsSync(toolConfigPath)) {
          clearInterval(interval)
          onToolFolderChange()
        }
      }, 10000).unref()
      watchers.push({ close: () => { clearInterval(interval) } } as fs.FSWatcher)
      continue
    } else {
      watchers.push(fs.watch(toolConfigPath, { persistent: false, recursive: false }, () => { onToolFolderChange() }))
    }

    try {
      const toolConfig = JSON.parse(fs.readFileSync(toolConfigPath, 'utf-8'))
      updatedTools[url.pathToFileURL(toolPath).href] = toolConfig as Tool
    } catch {}
  }
  return updatedTools
}

/**
 *
 */
function updateTools (updatedTools: Record<string, Tool>) : void {
  const updatedToolsKeys = Object.keys(updatedTools)
  const existingToolsKeys = Object.keys(tools)

  let changed = false
  if (updatedToolsKeys.length !== existingToolsKeys.length) changed = true
  else {
    for (const key of updatedToolsKeys) {
      if (!(key in tools)) changed = true
      else for (const prop of [...Object.keys(updatedTools[key]), ...Object.keys(tools[key])]) {
        if (updatedTools[key][prop as keyof Tool] !== tools[key][prop as keyof Tool]) {
          changed = true
          break
        }
      }
      if (changed) break
    }
  }
  if (changed === false) {
    if (Object.keys(updatedTools).length === 0) prompts.onToolListChanged(Object.keys(tools))
    return
  }

  Object.keys(tools).forEach(key => { delete tools[key] })
  Object.assign(tools, updatedTools)

  notify('notifications/tools/list_changed')
  resources.onToolListChanged(Object.keys(tools))
  prompts.onToolListChanged(Object.keys(tools))
}

/**
 */
function installDependencies (cwd: string, progress: AiOperations['progress']) : Promise<void> {
  return new Promise((resolve, reject) => {
    progress(0, 'Installing tool dependencies...')
    try {
      cmd.execSync('npm --version', { stdio: 'ignore' })
    } catch (err) {
      progress(100, 'Failed to install tool dependencies: npm is not installed or not found in PATH.')
      return resolve()
    }

    const npm = cmd.spawn('npm', ['install', '--progress=true'], { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: 'true' } })
    npm.stdout.on('data', (data : Buffer) => {
      const output = data.toString()
      const match = output.match(/(\d+)%/)
      if (match) progress(parseInt(match[1], 10), `Installing tool dependencies... (${match[1]}%)`)
    })

    npm.on('close', () => {
      progress(100, 'Tool dependencies installed.')
      resolve()
    })
  })
}
