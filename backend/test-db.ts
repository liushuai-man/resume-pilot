import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const templates = await prisma.template.findMany();
    console.log(`Found ${templates.length} templates`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

test();
