import notify from './notify.ts'

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/progress#progress-flow
 */
export default function progress (progressToken: string, progress: number, message?: string, total?: number) : void {
  notify('notifications/progress', { progressToken, progress, message, total })
}
