import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import app from './app';
import { PrismaClient } from '@prisma/client';
import config from './config';

const prisma = new PrismaClient();

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Ensure uploads directory exists
    const uploadDir = config.uploadDir || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📡 Health check: http://localhost:${config.port}/api/health`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
