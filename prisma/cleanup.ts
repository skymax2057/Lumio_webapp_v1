import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting Lumio database cleanup...');

  // 1. Delete all records in correct order (respecting foreign keys)
  await prisma.notification.deleteMany();
  console.log('✅ Deleted all notifications');

  await prisma.like.deleteMany();
  console.log('✅ Deleted all likes');

  await prisma.collectionImage.deleteMany();
  console.log('✅ Deleted all collection-image associations');

  await prisma.collection.deleteMany();
  console.log('✅ Deleted all collections');

  await prisma.image.deleteMany();
  console.log('✅ Deleted all images');

  await prisma.category.deleteMany();
  console.log('✅ Deleted all categories');

  await prisma.user.deleteMany();
  console.log('✅ Deleted all users');

  // 2. Clean up uploaded image files
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      fs.unlinkSync(filePath);
    }
    console.log(`✅ Deleted ${files.length} uploaded image files`);
  }

  console.log('🎉 Database cleanup completed successfully!');
  console.log('📊 Database is now empty and ready for fresh data.');
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
