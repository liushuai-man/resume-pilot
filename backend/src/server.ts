import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';
import { createClient } from 'redis';

const redisClient = createClient({ url: env.REDIS_URL });

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL run successful');

    await redisClient.connect();
    await redisClient.ping();
    console.log('✅ Redis run successful');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
