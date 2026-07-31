import { trace } from '../common/tracing';
export class CommandParser {
  async parse(text: string): Promise<{ intent: string; parameters: any; confidence: number }> {
    await trace({ type: 'command.received', payload: { text } });

    const lower = text.toLowerCase();
    if (lower.includes('open') || lower.includes('launch')) {
      const m = lower.match(/open\s+([a-z0-9 ]+)/);
      const app = m ? m[1].trim() : 'unknown';
      const parsed = { intent: 'open_app', parameters: { app }, confidence: 0.9 };
      await trace({ type: 'ai.interpretation', payload: parsed });
      return parsed;
    }
    if (lower.includes('volume') || lower.includes('turn down') || lower.includes('turn up')) {
      const parsed = { intent: 'volume_down', parameters: { level: 1 }, confidence: 0.8 };
      await trace({ type: 'ai.interpretation', payload: parsed });
      return parsed;
    }

    const fallback = { intent: 'press_key', parameters: { key: 'InputSelect' }, confidence: 0.3 };
    await trace({ type: 'ai.interpretation', payload: fallback });
    return fallback;
  }
}
