import Fastify, { FastifyInstance } from 'fastify';
import { DeviceManager } from './devices/DeviceManager';
import { logger } from './common/logger';
import { RemoteCommand } from './remote/RemoteCommand';
import { ActionExecutor } from './remote/ActionExecutor';
import { CommandParser } from './ai/CommandParser';

export async function startServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const deviceManager = new DeviceManager();
  const actionExecutor = new ActionExecutor(deviceManager);
  const parser = new CommandParser();

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/devices', async () => deviceManager.listDevices());

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
