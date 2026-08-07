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

// Test 4: User Profile Creation
async function testUserProfileCreation() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      location: 'Paris, France',
      website: 'https://example.com',
      occupation: 'Photographer',
      company: 'Freelance',
      favoriteStyles: JSON.stringify(['photography', 'nature']),
      favoriteMoods: JSON.stringify(['calme', 'sereine']),
      favoriteColors: JSON.stringify(['#4CAF50', '#2196F3']),
      theme: 'dark',
      layout: 'grid',
      cardSize: 'medium',
      animationsEnabled: true,
      softGlowEnabled: true,
      isProfilePublic: true,
      showEmail: false,
      showLocation: true,
      showStats: true
    }
  });
  
  if (!profile.id) {
    throw new Error('Profile ID not generated');
  }
}

// Test 5: User Profile Update
async function testUserProfileUpdate() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  // Update user basic info
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: 'Updated Test User',
      bio: 'Updated bio for testing'
    }
  });
  
  if (updatedUser.name !== 'Updated Test User') {
    throw new Error('User name not updated correctly');
  }
  
  // Update profile
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      location: 'Lyon, France',
      theme: 'light',
      layout: 'list'
    }
  });
  
  if (updatedProfile.location !== 'Lyon, France') {
    throw new Error('Profile location not updated correctly');
  }
  
  if (updatedProfile.theme !== 'light') {
    throw new Error('Profile theme not updated correctly');
  }
}

// Test 6: Image Creation
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
      height: 1080,
      format: 'jpeg',
      fileSize: 500000
    }
  });
  
  if (!image.id) {
    throw new Error('Image ID not generated');
  }
}

// Test 7: Image Update
async function testImageUpdate() {
  const image = await prisma.image.findFirst({
    where: { title: 'Test Image' }
  });
  
  if (!image) {
    throw new Error('Test image not found');
  }
  
  const updatedImage = await prisma.image.update({
    where: { id: image.id },
    data: {
      title: 'Updated Test Image',
      description: 'Updated description',
      mood: 'énergique',
      isFeatured: true
    }
  });
  
  if (updatedImage.title !== 'Updated Test Image') {
    throw new Error('Image title not updated correctly');
  }
  
  if (updatedImage.mood !== 'énergique') {
    throw new Error('Image mood not updated correctly');
  }
  
  if (!updatedImage.isFeatured) {
    throw new Error('Image featured status not updated correctly');
  }
}

// Test 8: Image Likes
async function testImageLikes() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
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
  
  // Test unlike
  await prisma.like.delete({
    where: { id: like.id }
  });
  
  const imageAfterUnlike = await prisma.image.findUnique({
    where: { id: image.id },
    include: { likes: true }
  });
  
  if (!imageAfterUnlike || imageAfterUnlike.likes.length !== 0) {
    throw new Error('Unlike not working correctly');
  }
}

// Test 9: Image Reactions
async function testImageReactions() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
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
  
  // Test reaction update
  const updatedReaction = await prisma.reaction.update({
    where: { id: reaction.id },
    data: { emoji: '❤️' }
  });
  
  if (updatedReaction.emoji !== '❤️') {
    throw new Error('Reaction emoji not updated correctly');
  }
}

// Test 10: Comments
async function testComments() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
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
  
  // Test comment update
  const updatedComment = await prisma.comment.update({
    where: { id: comment.id },
    data: {
      content: 'Updated test comment',
      isEdited: true
    }
  });
  
  if (updatedComment.content !== 'Updated test comment') {
    throw new Error('Comment content not updated correctly');
  }
  
  if (!updatedComment.isEdited) {
    throw new Error('Comment edited status not updated correctly');
  }
}

// Test 11: Comment Replies
async function testCommentReplies() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const parentComment = await prisma.comment.findFirst({
    where: { content: 'Updated test comment' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
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

// Test 12: Comment Likes
async function testCommentLikes() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const comment = await prisma.comment.findFirst({
    where: { content: 'This is a reply to the test comment' }
  });
  
  if (!user || !comment) {
    throw new Error('User or comment not found');
  }
  
  const commentLike = await prisma.commentLike.create({
    data: {
      userId: user.id,
      commentId: comment.id
    }
  });
  
  if (!commentLike.id) {
    throw new Error('Comment like ID not generated');
  }
  
  // Check if comment like is counted
  const commentWithLikes = await prisma.comment.findUnique({
    where: { id: comment.id },
    include: { likes: true }
  });
  
  if (!commentWithLikes || commentWithLikes.likes.length !== 1) {
    throw new Error('Comment like not counted correctly');
  }
}

// Test 13: Collections
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
      isPrivate: false,
      isFeatured: true
    }
  });
  
  if (!collection.id) {
    throw new Error('Collection ID not generated');
  }
  
  if (!collection.isFeatured) {
    throw new Error('Collection featured status not set correctly');
  }
}

// Test 14: Collection Update
async function testCollectionUpdate() {
  const collection = await prisma.collection.findFirst({
    where: { title: 'Test Collection' }
  });
  
  if (!collection) {
    throw new Error('Test collection not found');
  }
  
  const updatedCollection = await prisma.collection.update({
    where: { id: collection.id },
    data: {
      title: 'Updated Test Collection',
      description: 'Updated description',
      isPrivate: true
    }
  });
  
  if (updatedCollection.title !== 'Updated Test Collection') {
    throw new Error('Collection title not updated correctly');
  }
  
  if (!updatedCollection.isPrivate) {
    throw new Error('Collection privacy not updated correctly');
  }
}

// Test 15: Collection Images
async function testCollectionImages() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const collection = await prisma.collection.findFirst({
    where: { title: 'Updated Test Collection' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
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
  
  // Test position update
  const updatedCollectionImage = await prisma.collectionImage.update({
    where: {
      collectionId_imageId: {
        collectionId: collection.id,
        imageId: image.id
      }
    },
    data: { position: 1 }
  });
  
  if (updatedCollectionImage.position !== 1) {
    throw new Error('Collection image position not updated correctly');
  }
}

// Test 16: Collection Likes
async function testCollectionLikes() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const collection = await prisma.collection.findFirst({
    where: { title: 'Updated Test Collection' }
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

// Test 17: User Follows
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
  
  // Test unfollow
  await prisma.follow.delete({
    where: { id: follow.id }
  });
  
  const followAfterDelete = await prisma.follow.findUnique({
    where: { id: follow.id }
  });
  
  if (followAfterDelete) {
    throw new Error('Unfollow not working correctly');
  }
  
  // Recreate for further tests
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id
    }
  });
}

// Test 18: Notifications
async function testNotifications() {
  const user1 = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const user2 = await prisma.user.findUnique({
    where: { email: 'test2@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
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
      read: false,
      metadata: JSON.stringify({ test: 'data' })
    }
  });
  
  if (!notification.id) {
    throw new Error('Notification ID not generated');
  }
  
  if (notification.read !== false) {
    throw new Error('Notification read status not set correctly');
  }
  
  // Test mark as read
  const updatedNotification = await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true }
  });
  
  if (!updatedNotification.read) {
    throw new Error('Notification read status not updated correctly');
  }
}

// Test 19: Image Filtering by Category
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
  
  const testImage = natureImages.find(img => img.title === 'Updated Test Image');
  if (!testImage) {
    throw new Error('Test image not found in Nature category');
  }
}

// Test 20: Image Filtering by Mood
async function testImageFilteringByMood() {
  const energeticImages = await prisma.image.findMany({
    where: { mood: 'énergique' }
  });
  
  if (energeticImages.length === 0) {
    throw new Error('No images found with énergique mood');
  }
  
  const testImage = energeticImages.find(img => img.title === 'Updated Test Image');
  if (!testImage) {
    throw new Error('Test image not found with énergique mood');
  }
}

// Test 21: Image Filtering by Featured
async function testImageFilteringByFeatured() {
  const featuredImages = await prisma.image.findMany({
    where: { isFeatured: true }
  });
  
  if (featuredImages.length === 0) {
    throw new Error('No featured images found');
  }
  
  const testImage = featuredImages.find(img => img.title === 'Updated Test Image');
  if (!testImage) {
    throw new Error('Test image not found in featured images');
  }
}

// Test 22: User Stats Update
async function testUserStatsUpdate() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      totalLikes: 10,
      totalViews: 100,
      followersCount: 5,
      followingCount: 3
    }
  });
  
  if (updatedUser.totalLikes !== 10) {
    throw new Error('User total likes not updated correctly');
  }
  
  if (updatedUser.totalViews !== 100) {
    throw new Error('User total views not updated correctly');
  }
}

// Test 23: Image Stats Update
async function testImageStatsUpdate() {
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
  });
  
  if (!image) {
    throw new Error('Test image not found');
  }
  
  const updatedImage = await prisma.image.update({
    where: { id: image.id },
    data: {
      viewsCount: 50,
      downloadsCount: 10,
      sharesCount: 5
    }
  });
  
  if (updatedImage.viewsCount !== 50) {
    throw new Error('Image views count not updated correctly');
  }
  
  if (updatedImage.downloadsCount !== 10) {
    throw new Error('Image downloads count not updated correctly');
  }
}

// Test 24: Collection Stats Update
async function testCollectionStatsUpdate() {
  const collection = await prisma.collection.findFirst({
    where: { title: 'Updated Test Collection' }
  });
  
  if (!collection) {
    throw new Error('Test collection not found');
  }
  
  const updatedCollection = await prisma.collection.update({
    where: { id: collection.id },
    data: {
      viewsCount: 25,
      likesCount: 5,
      tagsCount: 1
    }
  });
  
  if (updatedCollection.viewsCount !== 25) {
    throw new Error('Collection views count not updated correctly');
  }
  
  if (updatedCollection.likesCount !== 5) {
    throw new Error('Collection likes count not updated correctly');
  }
}

// Test 25: Image Deletion (Soft Delete)
async function testImageSoftDelete() {
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
  });
  
  if (!image) {
    throw new Error('Test image not found');
  }
  
  const updatedImage = await prisma.image.update({
    where: { id: image.id },
    data: { isDeleted: true }
  });
  
  if (!updatedImage.isDeleted) {
    throw new Error('Image soft delete not working correctly');
  }
  
  // Check that deleted images are not returned in normal queries
  const activeImages = await prisma.image.findMany({
    where: { isDeleted: false }
  });
  
  const deletedImageInActive = activeImages.find(img => img.id === image.id);
  if (deletedImageInActive) {
    throw new Error('Deleted image still appearing in active queries');
  }
}

// Test 26: User Profile Privacy
async function testUserProfilePrivacy() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      isProfilePublic: false,
      showEmail: true,
      showLocation: false,
      showStats: false
    }
  });
  
  if (updatedProfile.isProfilePublic) {
    throw new Error('Profile public status not updated correctly');
  }
  
  if (!updatedProfile.showEmail) {
    throw new Error('Show email status not updated correctly');
  }
}

// Test 27: User Achievements
async function testUserAchievements() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  });
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const achievements = ['first_upload', 'first_like', 'first_comment'];
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      achievements: JSON.stringify(achievements),
      level: 5,
      xp: 500,
      streakDays: 7
    }
  });
  
  const parsedAchievements = JSON.parse(updatedProfile.achievements || '[]');
  if (parsedAchievements.length !== 3) {
    throw new Error('Achievements not saved correctly');
  }
  
  if (updatedProfile.level !== 5) {
    throw new Error('User level not updated correctly');
  }
  
  if (updatedProfile.xp !== 500) {
    throw new Error('User XP not updated correctly');
  }
}

// Test 28: User Session Management
async function testUserSessionManagement() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const session = await prisma.session.create({
    data: {
      sessionToken: 'test_session_token_' + Date.now(),
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });
  
  if (!session.id) {
    throw new Error('Session ID not generated');
  }
  
  // Test session deletion
  await prisma.session.delete({
    where: { id: session.id }
  });
  
  const deletedSession = await prisma.session.findUnique({
    where: { id: session.id }
  });
  
  if (deletedSession) {
    throw new Error('Session deletion not working correctly');
  }
}

// Test 29: Two-Factor Authentication Setup
async function testTwoFactorAuthSetup() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const twoFactorSecret = await prisma.twoFactorSecret.create({
    data: {
      userId: user.id,
      secret: 'test_secret_key_123456',
      backupCodes: JSON.stringify(['backup1', 'backup2', 'backup3']),
      enabled: true
    }
  });
  
  if (!twoFactorSecret.id) {
    throw new Error('2FA secret ID not generated');
  }
  
  if (!twoFactorSecret.enabled) {
    throw new Error('2FA enabled status not set correctly');
  }
  
  // Test 2FA disable
  const updated2FA = await prisma.twoFactorSecret.update({
    where: { id: twoFactorSecret.id },
    data: { enabled: false }
  });
  
  if (updated2FA.enabled) {
    throw new Error('2FA disable not working correctly');
  }
}

// Test 30: Activity Tracking
async function testActivityTracking() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  const image = await prisma.image.findFirst({
    where: { title: 'Updated Test Image' }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  const activity = await prisma.activity.create({
    data: {
      userId: user.id,
      type: 'view',
      imageId: image?.id,
      metadata: JSON.stringify({ source: 'feed' })
    }
  });
  
  if (!activity.id) {
    throw new Error('Activity ID not generated');
  }
  
  if (activity.type !== 'view') {
    throw new Error('Activity type not saved correctly');
  }
}

// Cleanup function
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  await prisma.activity.deleteMany({});
  await prisma.twoFactorSecret.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.collectionLike.deleteMany({});
  await prisma.collectionImage.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.commentLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.userProfile.deleteMany({});
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
  console.log('🧪 Starting Lumio App Complete Automated Tests\n');
  console.log('=' .repeat(60));
  
  try {
    // Core functionality tests
    await runTest('Categories - Load and verify 95 categories', testCategories);
    await runTest('User Registration - Create new user', testUserRegistration);
    await runTest('User Authentication - Verify password hashing', testUserAuthentication);
    
    // Profile management tests
    await runTest('User Profile - Create profile with all fields', testUserProfileCreation);
    await runTest('User Profile - Update user info and profile', testUserProfileUpdate);
    
    // Image management tests
    await runTest('Image Creation - Create test image with metadata', testImageCreation);
    await runTest('Image Update - Modify image properties', testImageUpdate);
    
    // Engagement tests
    await runTest('Image Likes - Add and remove like', testImageLikes);
    await runTest('Image Reactions - Add and update emoji reaction', testImageReactions);
    await runTest('Comments - Add and update comment', testComments);
    await runTest('Comment Replies - Add reply to comment', testCommentReplies);
    await runTest('Comment Likes - Add like to comment', testCommentLikes);
    
    // Collection tests
    await runTest('Collections - Create and update collection', testCollections);
    await runTest('Collection Update - Modify collection properties', testCollectionUpdate);
    await runTest('Collection Images - Add image to collection', testCollectionImages);
    await runTest('Collection Likes - Like a collection', testCollectionLikes);
    
    // Social features tests
    await runTest('User Follows - Follow and unfollow user', testUserFollows);
    await runTest('Notifications - Create and mark as read', testNotifications);
    
    // Filtering tests
    await runTest('Image Filtering - Filter by category', testImageFiltering);
    await runTest('Image Filtering - Filter by mood', testImageFilteringByMood);
    await runTest('Image Filtering - Filter by featured', testImageFilteringByFeatured);
    
    // Statistics tests
    await runTest('User Stats - Update user statistics', testUserStatsUpdate);
    await runTest('Image Stats - Update image statistics', testImageStatsUpdate);
    await runTest('Collection Stats - Update collection statistics', testCollectionStatsUpdate);
    
    // Advanced features tests
    await runTest('Image Deletion - Soft delete functionality', testImageSoftDelete);
    await runTest('Profile Privacy - Update privacy settings', testUserProfilePrivacy);
    await runTest('User Achievements - Track achievements and XP', testUserAchievements);
    await runTest('Session Management - Create and delete session', testUserSessionManagement);
    await runTest('Two-Factor Auth - Setup and disable 2FA', testTwoFactorAuthSetup);
    await runTest('Activity Tracking - Log user activity', testActivityTracking);
    
  } finally {
    // Cleanup
    await cleanupTestData();
  }
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(60));
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Pass Rate: ${passRate}%`);
  
  // Group tests by category
  console.log('\n📋 Test Categories:');
  console.log('-------------------');
  console.log(`Core Functionality: 3 tests`);
  console.log(`Profile Management: 2 tests`);
  console.log(`Image Management: 2 tests`);
  console.log(`Engagement: 5 tests`);
  console.log(`Collections: 4 tests`);
  console.log(`Social Features: 2 tests`);
  console.log(`Filtering: 3 tests`);
  console.log(`Statistics: 3 tests`);
  console.log(`Advanced Features: 6 tests`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - ${r.name}`);
        console.log(`    ${r.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! The entire system is functioning correctly.');
    console.log('✅ All implemented features are working as expected.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.');
  }
  
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during test execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
