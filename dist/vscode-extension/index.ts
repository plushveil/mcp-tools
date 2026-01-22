import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const didChangeEmitter = new vscode.EventEmitter<void>()
 
  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('tools', {
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    provideMcpServerDefinitions: async () => {
      const env = Object.fromEntries(Object.entries(process.env).filter(([_, v]) => v !== undefined)) as Record<string, string | number>
      const output: vscode.McpServerDefinition[] = [
        new vscode.McpStdioServerDefinition('tools', 'node', ['./mcp/mcp-tools.js'], env)
      ]
      return output
    }
  }))
}
