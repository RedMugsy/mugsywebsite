import { PrismaClient } from '@prisma/client';

// Global singleton Prisma client for Perfect Integrity Community Newsletter
let prisma: PrismaClient | null = null;

export function getDb() {
  if (!prisma) {
    prisma = new PrismaClient({
      // Prisma will automatically use DATABASE_URL from environment
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
  process.exit(0);
});