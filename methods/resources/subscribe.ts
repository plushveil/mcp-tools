import type { JSONRPCRequest } from '../../types.d.ts'

/**
 *
 */
type ResourcesSubscribeRequest = {
  uri: string,
}

/**
 * The protocol supports optional subscriptions to resource changes.
 * Clients can subscribe to specific resources and receive notifications when they change.
 * @see https://modelcontextprotocol.info/specification/2024-11-05/server/resources/#subscriptions
 */
export default async function resourcesSubscribe (request: JSONRPCRequest<ResourcesSubscribeRequest>) : Promise<void> {
}
