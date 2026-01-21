import type { PromptMessage } from '../methods/prompts/get.ts'

import ask from './ask.ts'

type SampleResponse = { model: string } & PromptMessage

/**
 * The Model Context Protocol (MCP) provides a standardized way for servers
 * to request LLM sampling (“completions” or “generations”) from language models via clients.
 * This flow allows clients to maintain control over model access, selection, and permissions
 * while enabling servers to leverage AI capabilities—with no server API keys necessary.
 * Servers can request text or image-based interactions and optionally include context from MCP servers in their prompts.
 * @see https://modelcontextprotocol.info/specification/2024-11-05/client/sampling/
 */
export default async function sample (...messages: PromptMessage[]) : Promise<SampleResponse> {
  const response = (await ask<SampleResponse>('sampling/createMessage', { messages })).result!
  return response
}
