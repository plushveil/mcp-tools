---
description: 'Generate an example resource file via MCP.'
---

You MUST use the MCP tool to create a file. Do NOT generate or simulate the file contents yourself.

Call the MCP tool to create a resource file named "test.txt" on disk.

The file content must be exactly:
${input:content:The content of the resource file to be generated.}

Rules:
- Do not output the file content in the chat.
- Do not describe the file.
- Do not construct the file yourself.
- Only perform a tool call to MCP that writes the file in the correct location with the correct content.
- If the tool is not called, the task is considered failed.
