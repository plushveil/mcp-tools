import notify from './notify.ts'

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
  notify('notifications/message', {
    level: level,
    data: data.length === 1 ? data[0] : [...data]
  })
}
