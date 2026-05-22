import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    // Inicialización del driver adapter de better-sqlite3 según los estándares de Prisma v7
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
