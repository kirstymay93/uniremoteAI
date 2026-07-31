import { logger } from './logger';
import { config } from '../config';

export type TraceEvent =
  | { type: 'command.received'; payload: any }
  | { type: 'ai.interpretation'; payload: any }
  | { type: 'device.selected'; payload: any }
  | { type: 'action.executed'; payload: any }
  | { type: 'action.result'; payload: any };

export async function trace(event: TraceEvent) {
  // If LangSmith enabled, forward to LangSmith API (not implemented here)
  logger.info({ trace: event }, 'trace');
  // store to DB or external telemetry as needed
}
