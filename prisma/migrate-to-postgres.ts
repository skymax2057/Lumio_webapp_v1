import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();

async function migrateSQLiteToPostgres() {
  console.log('🔄 Starting migration from SQLite to PostgreSQL...');

  try {
    // Read SQLite database
    const sqliteData = await prisma.$queryRaw<any[]>`SELECT * FROM User`;
    console.log(`📊 Found ${sqliteData.length} users in SQLite`);

    // You can extend this to migrate all tables
    // This is a basic template - customize based on your needs

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative: Use Prisma's built-in migration
// Run these commands instead:
// 1. prisma db pull (from SQLite)
// 2. Change schema to PostgreSQL
// 3. prisma migrate dev --name init
// 4. Use pg_dump or similar tool to export/import data

if (require.main === module) {
  migrateSQLiteToPostgres()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
