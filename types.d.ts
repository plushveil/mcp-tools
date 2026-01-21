/**
 * @see https://www.jsonrpc.org/specification#request_object
 */
export type JSONRPCNotification<params = unknown> = {
  jsonrpc: "2.0"
  method: string
  params?: params
}

/**
 * @see https://www.jsonrpc.org/specification#request_object
 */
export type JSONRPCRequest<params = unknown> = {
  jsonrpc: "2.0"
  method: string
  id: string | number
  params?: params
}

/**
 * @see https://www.jsonrpc.org/specification#response_object
 */
export type JSONRPCResponse<result = unknown> = {
  jsonrpc: "2.0"
  id: string | number
  result?: result
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

/**
 *
 */
export type JSONRPCHandler = (request: JSONRPCRequest) => Promise<JSONRPCResponse | void>

/**
 *
 */
export type PaginationRequest = {
  cursor?: string
}

/**
 *
 */
export type PaginationResponse = {
  nextCursor?: string
}

