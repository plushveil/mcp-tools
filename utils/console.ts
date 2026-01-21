import type { JSONRPCNotification } from '../types.d.ts'

type Level = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency'

export default {
  debug: log.bind(null, 'debug'),         // Detailed debugging information
  info: log.bind(null, 'info'),           // General informational messages
  notice: log.bind(null, 'notice'),       // Normal but significant events
  warning: log.bind(null, 'warning'),     // Warning conditions
  error: log.bind(null, 'error'),         // Error conditions
  critical: log.bind(null, 'critical'),   // Critical conditions
  alert: log.bind(null, 'alert'),         // Action must be taken immediately
  emergency: log.bind(null, 'emergency'), // System is unusable
}

/**
 *
 */
function log (level: Level, ...data: unknown[]) : void {
  const request: JSONRPCNotification = {
    jsonrpc: '2.0',
    method: 'notifications/message',
    params: {
      level: level,
      data: data.length === 1 ? data[0] : [...data]
    }
  }

  console.log(JSON.stringify(request))
}
