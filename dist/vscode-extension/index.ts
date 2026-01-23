import * as path from 'node:path'
import * as cmd from 'node:child_process'
import * as vscode from 'vscode'

/**
 *
 */
export function activate (context: vscode.ExtensionContext) {
  console.log('Extension "MCP Tools" is now active.')
  if (!__dirname) throw new Error('__dirname is undefined')
  let node
  try {
    node = cmd.execSync(`node -p "process.execPath"`, { encoding: "utf8" }).trim()
  } catch {
    node = process.execPath
  }
  if (!node) throw new Error('process.execPath is undefined')

  const didChangeEmitter = new vscode.EventEmitter<void>()
  const mcp = vscode.lm.registerMcpServerDefinitionProvider('plushveil.mcp-tools', {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: () => {
      const env = Object.fromEntries(Object.entries(process.env).filter(([_, v]) => v !== undefined)) as Record<string, string | number>
      const output: vscode.McpServerDefinition[] = [
        new vscode.McpStdioServerDefinition('plushveil.mcp-tools', node, [path.resolve(__dirname, 'mcp.js')], env)
      ]
      return output
    },
    resolveMcpServerDefinition: async (definition: vscode.McpServerDefinition) => {
      return definition
    }
  })
  context.subscriptions.push(mcp)
}

/**
 *
 */
export function deactivate () {
  console.log('Extension "MCP Tools" is now deactivated.')
}
