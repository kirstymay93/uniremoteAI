import Fastify, { FastifyInstance } from 'fastify';
import { DeviceManager } from './devices/DeviceManager';
import { logger } from './common/logger';
import { RemoteCommand } from './remote/RemoteCommand';
import { ActionExecutor } from './remote/ActionExecutor';
import { CommandParser } from './ai/CommandParser';
import registerDrivers from './devices/registerDrivers';
import { z } from 'zod';

export async function startServer(opts?: { deviceManager?: DeviceManager }): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const deviceManager = opts?.deviceManager ?? new DeviceManager();
  const actionExecutor = new ActionExecutor(deviceManager);
  const parser = new CommandParser();

  // register built-in drivers
  registerDrivers(deviceManager);

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/devices', async () => deviceManager.listDevices());

  app.get('/devices/:id', async (request, reply) => {
    const { id } = request.params as any;
    const dev = deviceManager.getDevice(id);
    if (!dev) {
      reply.code(404);
      return { error: 'not_found' };
    }
    return dev;
  });

  app.post('/devices/:id/connect', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const dev = await deviceManager.connectDevice(id);
      return dev;
    } catch (err: any) {
      if (err.message === 'device_not_found') {
        reply.code(404);
        return { error: 'device_not_found' };
      }
      if (err.message === 'driver_not_found') {
        reply.code(500);
        return { error: 'driver_not_found' };
      }
      reply.code(500);
      return { error: 'connect_failed', details: err?.message };
    }
  });

  app.post('/devices/:id/disconnect', async (request, reply) => {
    const { id } = request.params as any;
    try {
      const dev = await deviceManager.disconnectDevice(id);
      return dev;
    } catch (err: any) {
      if (err.message === 'device_not_found') {
        reply.code(404);
        return { error: 'device_not_found' };
      }
      if (err.message === 'driver_not_found') {
        reply.code(500);
        return { error: 'driver_not_found' };
      }
      reply.code(500);
      return { error: 'disconnect_failed', details: err?.message };
    }
  });

  const CommandSchema = z.object({
    command: z.object({
      action: z.string(),
      params: z.record(z.any()).optional(),
    }),
  });

  app.post('/devices/:id/command', async (request, reply) => {
    const { id } = request.params as any;
    const parse = CommandSchema.safeParse(request.body);
    if (!parse.success) {
      reply.code(400);
      return { error: 'validation', details: parse.error.format() };
    }
    const { command } = parse.data;
    try {
      const result = await deviceManager.sendCommandToDeviceById(id, { command: command.action, params: command.params });
      return { ok: true, result };
    } catch (err: any) {
      if (err.message === 'device_not_found') {
        reply.code(404);
        return { error: 'device_not_found' };
      }
      if (err.message === 'driver_not_found') {
        reply.code(500);
        return { error: 'driver_not_found' };
      }
      reply.code(500);
      return { error: 'command_failed', details: err?.message };
    }
  });

  // legacy AI endpoint
  app.post<{ Body: { text: string; deviceId?: string } }>(
    '/ai/command',
    async (request, reply) => {
      const { text, deviceId } = request.body;
      const parsed = await parser.parse(text);
      const command = RemoteCommand.fromIntent(parsed.intent, parsed.parameters);
      const result = await actionExecutor.execute(command, deviceId);
      return reply.send(result);
    }
  );

  return app;
}
