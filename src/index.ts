import 'dotenv/config';
import { startServer } from './server';
import { logger } from './common/logger';

async function main() {
  try {
    const server = await startServer();
    const port = process.env.PORT || 3000;
    await server.listen({ port: Number(port), host: '0.0.0.0' });
    logger.info({ port }, 'Server started');
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

main();
