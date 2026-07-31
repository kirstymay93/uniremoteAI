import { describe, it, expect, vi } from 'vitest';
import { startServer } from '../../src/server';

describe('Device API', () => {
  it('returns 404 for unknown device', async () => {
    // create a server with a mocked deviceManager
    const deviceManager = {
      listDevices: () => [],
      getDevice: (id: string) => null,
      connectDevice: vi.fn(),
      disconnectDevice: vi.fn(),
      sendCommandToDeviceById: vi.fn(),
    } as any;

    const app = await startServer({ deviceManager });
    const res = await app.inject({ method: 'GET', url: '/devices/does-not-exist' });
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('not_found');
  });

  it('validates command payload', async () => {
    const deviceManager = {
      listDevices: () => [],
      getDevice: (id: string) => ({ id, name: 'x' }),
      connectDevice: vi.fn(),
      disconnectDevice: vi.fn(),
      sendCommandToDeviceById: vi.fn().mockResolvedValue({ ok: true }),
    } as any;

    const app = await startServer({ deviceManager });
    const res = await app.inject({ method: 'POST', url: '/devices/d1/command', payload: { wrong: 'payload' } });
    expect(res.statusCode).toBe(400);
  });

  it('forwards command to device manager', async () => {
    const sendFn = vi.fn().mockResolvedValue({ status: 200 });
    const deviceManager = {
      listDevices: () => [],
      getDevice: (id: string) => ({ id, name: 'x' }),
      connectDevice: vi.fn(),
      disconnectDevice: vi.fn(),
      sendCommandToDeviceById: sendFn,
    } as any;

    const app = await startServer({ deviceManager });
    const res = await app.inject({ method: 'POST', url: '/devices/d1/command', payload: { command: { action: 'play', params: {} } } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
    expect(sendFn).toHaveBeenCalledWith('d1', { command: 'play', params: {} });
  });
});
