import * as path from 'node:path'
import * as url from 'node:url'
import * as vscode from 'vscode'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const node = process.execPath

export function activate(context: vscode.ExtensionContext) {
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
