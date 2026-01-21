import type { JSONRPCRequest, JSONRPCResponse } from '../../types.d.ts'

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/#completerequest
 */
type CompletionCompleteRequest= {
  ref: PromptReference | ResourceReference,
  argument: {
    name: string,
    value: string,
  }
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/#reference-types
 */
type PromptReference = {
  type: 'ref/prompt',
  name: string,
}

type ResourceReference = {
  type: 'ref/resource',
  uri: string,
}

/**
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/utilities/completion/#completion-results
 */
type CompleteResult = {
  completion: {
    values: string[],
    total?: number,
    hasMore: boolean,
  }
}

/**
 *
 */
export default async function completionComplete (request: JSONRPCRequest<CompletionCompleteRequest>) : Promise<JSONRPCResponse | void> {

}
