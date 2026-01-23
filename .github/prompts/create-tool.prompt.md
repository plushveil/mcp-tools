---
agent: agent
description: Bootstrap the first MCP tool in an empty workspace.
---

You are running inside a workspace that currently has **no tools**.

Your task is to create the **first MCP tool** by generating a new folder inside:

`./tools/<tool-name>/`

This tool will later be loaded as an MCP tool and must follow the provided file templates exactly, only filling in or extending them where necessary.

---

## Folder
- Create `./tools/<tool-name>/`
- The folder name **must be kebab-case**

---

## package.json
Create a `package.json` based on the following template:

```json
{
  "name": "",
  "description": "",
  "main": "index.ts",
  "type": "module",
  "inputSchema": {
    "type": "object",
    "properties": {
      "arg1": {
        "type": "string",
        "description": ""
      }
    },
    "required": ["arg1"]
  },
  "devDependencies": {
    "@plushveil/mcp-tools": "latest"
  }
}
```

**Rules:**
 - Fill in name and description
 - Expand or replace arg1 based on the provided arguments
 - Keep the schema MCP-compatible


## index.ts

Create an index.ts based on the following template:

```ts
import type { GenericInput, AiOperations, ToolCallResponse } from '@plushveil/mcp-tools'

/**
 * The input type for this tool.
 * It is derived from the `inputSchema` in package.json.
 */
type Input = GenericInput<{ arg1: string }>

/**
 * List of prompt files used by this tool.
 * Add any .prompt.md files you create here.
 */
type PromptFile = 'example.prompt.md' | 'another-example.prompt.md'

/**
 * Default tool entry point.
 *
 * This is the function that will be called when the tool is invoked.
 * - `input` contains the validated arguments based on `inputSchema`
 * - `ai` provides helper operations (progress, model access, etc.)
 *
 * Return a ToolCallResponse to indicate success/failure and output content.
 */
export default async function camelCase(
  input: Input,
  ai: AiOperations
): Promise<ToolCallResponse> {
  // Example: you can use ai.progress() to report progress
  // await ai.progress(0, 'Starting tool...')

  return {
    content: [{ type: 'text', text: '' }],   // Output content that the tool returns to the caller
    isError: false // Set to true if the tool encountered an error
  }
}

/**
 * Optional helper for the input schema and .prompt.md files.
 *
 * If your prompt files include ${input:...} placeholders, this function
 * can provide contextual suggestions for those fields.
 *
 * - `file` is the prompt file being edited ('input' for input schema arguments)
 * - `key` is the name of the placeholder
 * - `input` is the current text the user typed
 *
 * Return a list of suggestion strings.
 */
export async function getTextSuggestions(
  file: 'input' | PromptFile,
  key: string,
  input: string
): Promise<string[]> {
  // Example:
  // if (file === 'input' && key === 'arg1') {
  //   if (input.startsWith('e')) return ['example value']
  //   if (input.startsWith('a')) return ['another value']
  //   return ['example value', 'another value']
  // }
  return []
}
```

**Rules**
- Rename the default export to camelCase matching the tool name
- Update Input to match the generated inputSchema
- Add or remove PromptFile entries if you generate prompt files


## Prompt files
- Generate as many `.prompt.md` files as you deem useful for maximizing the tool's effectiveness
- be valid .prompt.md files with proper YAML front matter
  - include the agent (`agent`, `ask`, `edit`, `Plan`)
  - include a short description (single line) 
- Prompt files should:
  - use `${input:input_name:input_description}` placeholders
  - be referenced in `PromptFile` if text suggestions are implemented


## Important constraints
- Do not assume any existing tools
- Do not call tools or MCP APIs
- You are generating source files only
- Prefer sensible defaults over asking questions


## Inputs

Tool name: ${input:name:Tool name}

What the tool does:
${input:description:What the tool does}

Arguments for the tool, (convert from human readable to input schema):
${input:args:Arguments for the tool, used to build the input schema}


## Output

Generate the complete `./tools/<tool-name>/` folder and all files inside it.  
Ensure everything is internally consistent and ready to load.
