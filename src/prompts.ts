import type { Prompt } from '../methods/prompts/list.ts'
import type { PromptsGetResponse } from '../methods/prompts/get.ts'

import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as readline from 'readline'

import notify from '../utils/notify.ts'

type PromptDefinition = {
  file: string,
  tool: string,
  name: string,
  content: string,
  description?: string,
  arguments?: Prompt['arguments']
}

const watchers: fs.FSWatcher[] = []

const prompts: PromptDefinition[] = []

/**
 *
 */
export async function onToolListChanged (tools: string[]) : Promise<void> {
  const newPrompts: PromptDefinition[] = []
  for (const tool of tools.map(t => url.fileURLToPath(t))) {
    for (const file of fs.readdirSync(tool, { recursive: true })) {
      if (file.toString().endsWith('.prompt.md')) {
        newPrompts.push(await parsePromptFile(tool, path.join(tool, file.toString())))
      }
    }
  }

  if (newPrompts.map(p => p.name).sort().join(',') !== prompts.map(p => p.name).sort().join(',')) {
    while (prompts.length) { prompts.pop() }
    while (watchers.length) { watchers.pop() }
    for (const prompt of newPrompts) {
      prompts.push(prompt)
      watchers.push(fs.watch(prompt.file, { persistent: false, recursive: false }, async () => {
        if (!fs.existsSync(prompt.file)) {
          const index = prompts.findIndex(p => p.file === prompt.file)
          if (index !== -1) prompts.splice(index, 1)
          notify('notifications/prompts/list_changed')
          return
        }
        Object.assign(prompt, await parsePromptFile(prompt.tool, prompt.file))
      }))
    }
    notify('notifications/prompts/list_changed')
  }

  for (const tool of tools.map(t => url.fileURLToPath(t))) {
    watchers.push(fs.watch(tool, { recursive: true, persistent: false }, async (_e, filename) => {
      if (filename?.toLowerCase().endsWith('.prompt.md')) {
        const filePath = path.join(tool, filename)
        if (prompts.find(p => p.file === filePath)) return
        onToolListChanged(tools)
      }
    }))
  }
}

/**
 *
 */
export async function listPrompts() : Promise<Prompt[]> {
  const promptDefinitions: Prompt[] = []

  for (const prompt of prompts) {
    promptDefinitions.push({
      name: prompt.name,
      description: prompt.description,
      arguments: prompt.arguments,
    })
  }

  return promptDefinitions
}

/**
 *
 */
export async function getPrompt(name: string, params: Record<string, string>) : Promise<PromptsGetResponse> {
  const prompt = prompts.find(p => p.name === name)
  if (!prompt) throw new Error(`Prompt not found: ${name}`)

  let content = prompt.content
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`\\$\\{input:${key}(:[^}]+)?\\}`, 'g')
    content = content.replaceAll(regex, value)
  }

  return {
    description: prompt.description || '',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: content
        }
      }
    ]
  }
}

/**
 *
 */
async function parsePromptFile(tool: string, file: string) : Promise<PromptDefinition> {
  const defaultName = `${path.basename(tool)} ${path.basename(file, '.prompt.md')}`
  const prompt: Partial<PromptDefinition> = { name: defaultName, tool, file }
  const fileStream = fs.createReadStream(file)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let isHead = 1
  const content = []
  for await (const line of rl) {
    if (isHead && line.trim().match(/^--+$/)) {
      isHead++
      if (isHead > 2) isHead = 0
      continue
    }

    if (isHead) {
      const lcline = line.toLowerCase()
      if (prompt.name === defaultName && lcline.startsWith('name:')) {
        prompt.name = `${path.basename(tool)} ${line.slice('name:'.length).trim().replace(/^['"]|['"]$/g, '')}`
      }
      if (!prompt.description && lcline.startsWith('description:')) {
        prompt.description = line.slice('description:'.length).trim().replace(/^['"]|['"]$/g, '')
      }
      continue
    }

    if (line.includes('${input:')) {
      const regex = /\$\{input:([a-zA-Z0-9_-]+)(:([^}]+))?\}/g
      for (const match of line.matchAll(regex)) {
        if (!prompt.arguments) prompt.arguments = []
        prompt.arguments = prompt.arguments || []
        prompt.arguments.push({
          name: match[1],
          description: match[3].trim(),
          required: true
        })
      }
    }

    content.push(line)
  }
  prompt.content = content.join('\n').trim()

  return prompt as PromptDefinition
}
