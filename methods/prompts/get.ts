import type { JSONRPCRequest, JSONRPCResponse } from '../../src/types.d.ts'
import type { ResourceContent } from '../resources/read.ts'

import * as prompts from '../../src/prompts.ts'

/**
 *
 */
type PromptsGetRequest = {
  name: string,
  arguments?: Record<string, string>
}

/**
 *
 */
export type PromptsGetResponse = {
  description: string,
  messages: PromptMessage[]
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#promptmessage
 */
export type PromptMessage = {
  role: string;
  content: TextContent | ImageContent | EmbeddedResource;
}

/**
 * Text content represents plain text messages.
 * This is the most common content type used for natural language interactions.
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#text-content
 */
type TextContent = {
  type: 'text'
  text: string
}

/**
 * Image content allows including visual information in messages.
 * The image data MUST be base64-encoded and include a valid MIME type.
 * This enables multi-modal interactions where visual context is important.
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#image-content
 */
type ImageContent = {
  type: 'image'
  data: string,
  mimeType: string
}

/**
 * Embedded resources allow referencing server-side resources directly in messages.
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#embedded-resources
 */
type EmbeddedResource = {
  type: 'resource'
  resource: ResourceContent
}

/**
 * To retrieve a specific prompt, clients send a prompts/get request.
 * Arguments may be auto-completed through the completion API.
 * @returns {Promise<JSONRPCResponse<PromptsGetResponse>>} Array of messages forming the prompt
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/prompts/#getting-a-prompt
 */
export default async function promptsGet (request: JSONRPCRequest<PromptsGetRequest>) : Promise<JSONRPCResponse<PromptsGetResponse>> {
  const response: JSONRPCResponse<PromptsGetResponse> = {
    jsonrpc: '2.0',
    id: request.id,
    result: await prompts.getPrompt(request.params?.name || '', request.params?.arguments || {})
  }
  return response
}
