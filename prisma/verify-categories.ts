import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying categories in database...');

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${categories.length} categories:\n`);
  
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
  });

  console.log(`\n✅ Verification complete!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
