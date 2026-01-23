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
  const mcpServerDefinitionProvider : vscode.McpServerDefinitionProvider = {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: () => {
      const env = process.env as Record<string, string>
      const mcp = new vscode.McpStdioServerDefinition('plushveil.mcp-tools', node, [path.resolve(__dirname, 'mcp.js')], env)
      mcp.cwd = vscode.workspace.workspaceFolders?.find(f => f.uri)?.uri
      const output: vscode.McpServerDefinition[] = [mcp]
      return output
    },
    resolveMcpServerDefinition: async (definition: vscode.McpServerDefinition) => {
      return definition
    }
  }
  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('plushveil.mcp-tools', mcpServerDefinitionProvider))
}

/**
 *
 */
export function deactivate () {
  console.log('Extension "MCP Tools" is now deactivated.')
}
