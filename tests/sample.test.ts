import { describe, it, expect } from 'vitest';
import { CommandParser } from '../src/ai/CommandParser';

describe('CommandParser', () => {
  it('parses open Netflix', async () => {
    const p = new CommandParser();
    const r = await p.parse('Open Netflix');
    expect(r.intent).toBe('open_app');
  });
});
