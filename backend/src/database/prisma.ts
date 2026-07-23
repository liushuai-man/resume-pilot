let prismaInstance: any = null;

export async function getPrisma() {
  if (prismaInstance) {
    return prismaInstance;
  }
  
  const { PrismaClient } = await import('@prisma/client');
  prismaInstance = new PrismaClient({
    // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  return prismaInstance;
}

export const prisma = await getPrisma();
