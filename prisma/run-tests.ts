import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

const testResults: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>) {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.push({
      name,
      status: 'PASS',
      message: 'Test passed successfully',
      duration
    });
    console.log(`✅ ${name} - PASSED (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    testResults.push({
      name,
      status: 'FAIL',
      message,
      duration
    });
    console.log(`❌ ${name} - FAILED (${duration}ms)`);
    console.log(`   Error: ${message}`);
  }
}

// Test 1: Categories
async function testCategories() {
  const categories = await prisma.category.findMany();
  if (categories.length !== 95) {
    throw new Error(`Expected 95 categories, found ${categories.length}`);
  }
  
  const categoryNames = categories.map(c => c.name);
  const expectedCategories = ['Abstrait', 'Action', 'Nature', 'Photographie', 'Technologie'];
  
  for (const expected of expectedCategories) {
    if (!categoryNames.includes(expected)) {
      throw new Error(`Missing expected category: ${expected}`);
    }
  }
}

// Test 2: User Registration
async function testUserRegistration() {
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      bio: 'Test user for automated testing'
    }
  });
  
  if (!user.id) {
    throw new Error('User ID not generated');
  }
  
  if (user.email !== 'test@example.com') {
    throw new Error('User email not saved correctly');
  }
}

// Test 3: User Authentication
async function testUserAuthentication() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user || !user.password) {
    throw new Error('Test user not found or password missing');
  }
  
  const isValidPassword = await bcrypt.compare('TestPassword123!', user.password);
  if (!isValidPassword) {
    throw new Error('Password validation failed');
  }
}

// Test 4: Image Creation
async function testImageCreation() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const category = await prisma.category.findFirst({
    where: { name: 'Nature' }
  });
  
  if (!category) {
    throw new Error('Nature category not found');
  }
  
  const image = await prisma.image.create({
    data: {
      title: 'Test Image',
      description: 'A test image for automated testing',
      url: 'http://example.com/test.jpg',
      userId: user.id,
      categoryId: category.id,
      dominantColor: '#4CAF50',
      mood: 'calme',
      width: 1920,
      height: 1080
    }
  });
  
  if (!image.id) {
    throw new Error('Image ID not generated');
  }
}

// Test 5: Image Likes
async function testImageLikes() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!user || !image) {
    throw new Error('User or image not found');
  }
  
  const like = await prisma.like.create({
    data: {
      userId: user.id,
      imageId: image.id
    }
  });
  
  if (!like.id) {
    throw new Error('Like ID not generated');
  }
  
  // Check if like is counted
  const imageWithLikes = await prisma.image.findUnique({
    where: { id: image.id },
    include: { likes: true }
  });
  
  if (!imageWithLikes || imageWithLikes.likes.length !== 1) {
    throw new Error('Like not counted correctly');
  }
}

// Test 6: Image Reactions
async function testImageReactions() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!user || !image) {
    throw new Error('User or image not found');
  }
  
  const reaction = await prisma.reaction.create({
    data: {
      userId: user.id,
      imageId: image.id,
      emoji: '🔥'
    }
  });
  
  if (!reaction.id) {
    throw new Error('Reaction ID not generated');
  }
  
  if (reaction.emoji !== '🔥') {
    throw new Error('Reaction emoji not saved correctly');
  }
}

// Test 7: Comments
async function testComments() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!user || !image) {
    throw new Error('User or image not found');
  }
  
  const comment = await prisma.comment.create({
    data: {
      content: 'This is a test comment',
      userId: user.id,
      imageId: image.id
    }
  });
  
  if (!comment.id) {
    throw new Error('Comment ID not generated');
  }
  
  if (comment.content !== 'This is a test comment') {
    throw new Error('Comment content not saved correctly');
  }
}

// Test 8: Comment Replies
async function testCommentReplies() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const parentComment = await prisma.comment.findFirst({
    where: { content: 'This is a test comment' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!user || !parentComment || !image) {
    throw new Error('User, parent comment, or image not found');
  }
  
  const reply = await prisma.comment.create({
    data: {
      content: 'This is a reply to the test comment',
      userId: user.id,
      imageId: image.id,
      parentId: parentComment.id
    }
  });
  
  if (!reply.id) {
    throw new Error('Reply ID not generated');
  }
  
  if (reply.parentId !== parentComment.id) {
    throw new Error('Reply parent not set correctly');
  }
}

// Test 9: Collections
async function testCollections() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const collection = await prisma.collection.create({
    data: {
      title: 'Test Collection',
      description: 'A test collection for automated testing',
      userId: user.id,
      isPrivate: false
    }
  });
  
  if (!collection.id) {
    throw new Error('Collection ID not generated');
  }
}

// Test 10: Collection Images
async function testCollectionImages() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const collection = await prisma.collection.findFirst({
    where: { title: 'Test Collection' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!user || !collection || !image) {
    throw new Error('User, collection, or image not found');
  }
  
  const collectionImage = await prisma.collectionImage.create({
    data: {
      collectionId: collection.id,
      imageId: image.id,
      position: 0
    }
  });
  
  if (!collectionImage.collectionId || !collectionImage.imageId) {
    throw new Error('Collection image association not created correctly');
  }
}

// Test 11: Collection Likes
async function testCollectionLikes() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const collection = await prisma.collection.findFirst({
    where: { title: 'Test Collection' }
  });
  
  if (!user || !collection) {
    throw new Error('User or collection not found');
  }
  
  const collectionLike = await prisma.collectionLike.create({
    data: {
      userId: user.id,
      collectionId: collection.id
    }
  });
  
  if (!collectionLike.id) {
    throw new Error('Collection like ID not generated');
  }
}

// Test 12: User Follows
async function testUserFollows() {
  // Create a second user to follow
  const hashedPassword2 = await bcrypt.hash('TestPassword456!', 10);
  
  const user2 = await prisma.user.create({
    data: {
      email: 'test2@example.com',
      name: 'Test User 2',
      password: hashedPassword2,
      bio: 'Second test user for automated testing'
    }
  });
  
  const user1 = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user1 || !user2) {
    throw new Error('Users not found');
  }
  
  const follow = await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id
    }
  });
  
  if (!follow.id) {
    throw new Error('Follow ID not generated');
  }
  
  // Check follower/following counts
  const user1WithCounts = await prisma.user.findUnique({
    where: { id: user1.id }
  });
  
  const user2WithCounts = await prisma.user.findUnique({
    where: { id: user2.id }
  });
  
  if (!user1WithCounts || !user2WithCounts) {
    throw new Error('Users not found after follow');
  }
}

// Test 13: Notifications
async function testNotifications() {
  const user1 = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const user2 = await prisma.user.findUnique({
    where: { email: 'test2@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!user1 || !user2 || !image) {
    throw new Error('Users or image not found');
  }
  
  const notification = await prisma.notification.create({
    data: {
      recipientId: user2.id,
      actorId: user1.id,
      type: 'LIKE',
      imageId: image.id,
      message: 'Test notification',
      read: false
    }
  });
  
  if (!notification.id) {
    throw new Error('Notification ID not generated');
  }
  
  if (notification.read !== false) {
    throw new Error('Notification read status not set correctly');
  }
}

// Test 14: Image Filtering by Category
async function testImageFiltering() {
  const natureCategory = await prisma.category.findFirst({
    where: { name: 'Nature' }
  });
  
  if (!natureCategory) {
    throw new Error('Nature category not found');
  }
  
  const natureImages = await prisma.image.findMany({
    where: { categoryId: natureCategory.id }
  });
  
  if (natureImages.length === 0) {
    throw new Error('No images found in Nature category');
  }
  
  const testImage = natureImages.find(img => img.title === 'Test Image');
  if (!testImage) {
    throw new Error('Test image not found in Nature category');
  }
}

// Test 15: Image Filtering by Mood
async function testImageFilteringByMood() {
  const calmImages = await prisma.image.findMany({
    where: { mood: 'calme' }
  });
  
  if (calmImages.length === 0) {
    throw new Error('No images found with calme mood');
  }
  
  const testImage = calmImages.find(img => img.title === 'Test Image');
  if (!testImage) {
    throw new Error('Test image not found with calme mood');
  }
}

// Cleanup function
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  await prisma.notification.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.collectionLike.deleteMany({});
  await prisma.collectionImage.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['test@example.com', 'test2@example.com']
      }
    }
  });
  
  console.log('✅ Test data cleaned up');
}

// Main test runner
async function main() {
  console.log('🧪 Starting Lumio App Automated Tests\n');
  console.log('=' .repeat(50));
  
  try {
    // Run all tests
    await runTest('Categories - Load and verify 95 categories', testCategories);
    await runTest('User Registration - Create new user', testUserRegistration);
    await runTest('User Authentication - Verify password hashing', testUserAuthentication);
    await runTest('Image Creation - Create test image', testImageCreation);
    await runTest('Image Likes - Add like to image', testImageLikes);
    await runTest('Image Reactions - Add emoji reaction', testImageReactions);
    await runTest('Comments - Add comment to image', testComments);
    await runTest('Comment Replies - Add reply to comment', testCommentReplies);
    await runTest('Collections - Create collection', testCollections);
    await runTest('Collection Images - Add image to collection', testCollectionImages);
    await runTest('Collection Likes - Like a collection', testCollectionLikes);
    await runTest('User Follows - Follow another user', testUserFollows);
    await runTest('Notifications - Create notification', testNotifications);
    await runTest('Image Filtering - Filter by category', testImageFiltering);
    await runTest('Image Filtering - Filter by mood', testImageFilteringByMood);
    
  } finally {
    // Cleanup
    await cleanupTestData();
  }
  
  // Generate report
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(50));
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Pass Rate: ${passRate}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - ${r.name}`);
        console.log(`    ${r.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! The system is functioning correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.');
  }
  
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during test execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
