import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupUsers() {
  console.log('🗑️  Starting cleanup of all users and related data...');
  
  try {
    // Delete all users (this will cascade delete related data due to onDelete: Cascade)
    const result = await prisma.user.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.count} users and all related data`);
    console.log('📊 Related data automatically deleted via cascade:');
    console.log('   - Accounts');
    console.log('   - Sessions');
    console.log('   - Images');
    console.log('   - Likes');
    console.log('   - Reactions');
    console.log('   - Notifications');
    console.log('   - Collections');
    console.log('   - Comments');
    console.log('   - Follows');
    console.log('   - UserProfiles');
    console.log('   - TwoFactorSecrets');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUsers()
  .then(() => {
    console.log('✨ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
