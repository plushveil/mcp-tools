import * as path from 'node:path'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  if (!__dirname) throw new Error('__dirname is undefined')
  const node = process.execPath
  if (!node) throw new Error('process.execPath is undefined')

  const didChangeEmitter = new vscode.EventEmitter<void>() 
  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('tools', {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: () => {
      const env = Object.fromEntries(Object.entries(process.env).filter(([_, v]) => v !== undefined)) as Record<string, string | number>
      const output: vscode.McpServerDefinition[] = [
        new vscode.McpStdioServerDefinition('tools', node, [path.resolve(__dirname, 'mcp', 'mcp-tools.js')], env)
      ]
      return output
    },
    resolveMcpServerDefinition: async (definition: vscode.McpServerDefinition) => {
      return definition
    }
  }))
}
