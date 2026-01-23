import * as path from 'node:path'
import * as cmd from 'node:child_process'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
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
        new vscode.McpStdioServerDefinition('plushveil.mcp-tools', node, [path.resolve(__dirname, 'mcp', 'mcp-tools.js')], env)
      ]
      return output
    },
    resolveMcpServerDefinition: async (definition: vscode.McpServerDefinition) => {
      return definition
    }
  })
  context.subscriptions.push(mcp)

  const chatParticipant = vscode.chat.createChatParticipant('plushveil.mcp-tools-chat', async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken | undefined): Promise<{}> => {
    stream.markdown('So you are interested in calling tools from the plushveil.mcp, I\'ll try getting a list of tools soon...')
    return {}
  })
  context.subscriptions.push(chatParticipant)
}
