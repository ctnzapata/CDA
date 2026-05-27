import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrismaCache = global as unknown as { prismaCache: PrismaClient };

export const prisma =
  globalForPrismaCache.prismaCache ||
  (() => {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrismaCache.prismaCache = prisma;
