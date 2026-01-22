# @plushveil/mcp-tools

https://marketplace.visualstudio.com/items?itemName=plushveil.mcp-tools


**.vscode/mcp.json**

```json
{
  "servers": {
    "tools": {
      "type": "stdio",
      "command": "npx",
      "args": ["--yes", "@plushveil/mcp-tools"],
    }
  }
}
```

## About

Provides all tools from the workspaces `./tools/<tool_name>` folder in a model context.


## Getting Started

A minimal tool consist of:
-  `package.json` with:
    - `main` entry point
    - `inputSchema` following the [MCP Tool Input Schema](https://modelcontextprotocol.io/specification/2025-06-18/schema#tool-inputschema)
- `index.ts` or similar as an entry point
    - a default export of a function
        - the first argument is an object following the input schema
        - the second argument exposes some utilities like progress reporting and access to the model.
        - returns a [tool result](https://modelcontextprotocol.info/specification/2024-11-05/server/tools/#tool-result).
    - Optionally, a `getTextSuggestions` function that provides text suggestions for `${input}` placeholders in [.prompt.md files](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file#code-explanation-prompt).
- Optionally, a `[name].prompt.md` that provides predefined prompts to the model.
