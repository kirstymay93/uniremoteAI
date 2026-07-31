import process from 'process';

export const config = {
  port: Number(process.env.PORT || 3000),
  databasePath: process.env.DATABASE_PATH || './data/uniremote.db',
  logLevel: process.env.LOG_LEVEL || 'info',
  openAiKey: process.env.OPENAI_API_KEY || '',
  langsmithEnabled: (process.env.LANGSMITH_ENABLED === 'true'),
  langsmithKey: process.env.LANGSMITH_API_KEY || ''
};
