import type SampleUtil from './utils/sampling.ts'
import type AskUtil from './utils/ask.ts'
import type NotifyUtil from './utils/notify.ts'
import type ProgressUtil from './utils/progress.ts'
import type { ToolCallResponse } from './methods/tools/call.ts'
import type { DropFirst } from './src/types.d.ts'

export type GenericInput<T> = Record<string, unknown> & T

export type AiOperations = {
  progress: DropFirst<typeof ProgressUtil>
  notify: typeof NotifyUtil,
  ask: typeof AskUtil,
  sample: typeof SampleUtil,
}

export type { ToolCallResponse }
