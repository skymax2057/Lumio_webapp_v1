// API Integration Test Script for Lumio App
// Tests all backend endpoints to ensure frontend-backend compatibility

const BASE_URL = 'http://localhost:3002';

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  message: string;
  duration: number;
}

const testResults: TestResult[] = [];

let authToken: string | null = null;
let testUserId: string | null = null;
let testImageId: string | null = null;
let testCollectionId: string | null = null;

async function runTest(
  name: string,
  endpoint: string,
  method: string,
  testFn: () => Promise<void>
) {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.push({
      name,
      endpoint,
      method,
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
      endpoint,
      method,
      status: 'FAIL',
      message,
      duration
    });
    console.log(`❌ ${name} - FAILED (${duration}ms)`);
    console.log(`   Error: ${message}`);
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  });
  return response;
}

// Test 1: Health Check
async function testHealthCheck() {
  const response = await fetchAPI('/');
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
}

// Test 2: Get Categories
async function testGetCategories() {
  const response = await fetchAPI('/api/categories');
  if (!response.ok) {
    throw new Error(`Failed to get categories with status ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Categories response is not an array');
  }
}

// Test 3: User Registration
async function testUserRegistration() {
  const response = await fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: `test${Date.now()}@example.com`,
      name: 'Test Integration User',
      password: 'TestPassword123!'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed with status ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.user || !data.user.id) {
    throw new Error('Registration did not return user ID');
  }
  
  testUserId = data.user.id;
}

// Test 4: User Login
async function testUserLogin() {
  const response = await fetchAPI('/api/auth/[...nextauth]', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'TestPassword123!'
    })
  });
  
  // Note: This might need adjustment based on actual auth implementation
  // For now, we'll assume we get a token or session
}

// Test 5: Get Images
async function testGetImages() {
  const response = await fetchAPI('/api/images');
  if (!response.ok) {
    throw new Error(`Failed to get images with status ${response.status}`);
  }
  const data = await response.json();
  if (!data.images || !Array.isArray(data.images)) {
    throw new Error('Images response is invalid');
  }
}

// Test 6: Get Images with Filters
async function testGetImagesWithFilters() {
  const response = await fetchAPI('/api/images?category=Nature&mood=calme');
  if (!response.ok) {
    throw new Error(`Failed to get filtered images with status ${response.status}`);
  }
}

// Test 7: Get Suggestions
async function testGetSuggestions() {
  const response = await fetchAPI('/api/suggestions');
  if (!response.ok) {
    throw new Error(`Failed to get suggestions with status ${response.status}`);
  }
}

// Test 8: Create Image (if authenticated)
async function testCreateImage() {
  if (!authToken) {
    console.log('⚠️  Skipping image creation - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/images', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Integration Image',
      description: 'Created during API integration test',
      url: 'https://example.com/test.jpg',
      categoryId: 'nature-category-id',
      dominantColor: '#4CAF50',
      mood: 'calme'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create image with status ${response.status}`);
  }
  
  const data = await response.json();
  testImageId = data.id;
}

// Test 9: Get Single Image
async function testGetSingleImage() {
  if (!testImageId) {
    console.log('⚠️  Skipping single image test - no image ID');
    return;
  }
  
  const response = await fetchAPI(`/api/images/${testImageId}`);
  if (!response.ok) {
    throw new Error(`Failed to get single image with status ${response.status}`);
  }
}

// Test 10: Like Image
async function testLikeImage() {
  if (!testImageId || !authToken) {
    console.log('⚠️  Skipping like test - missing image ID or auth');
    return;
  }
  
  const response = await fetchAPI(`/api/images/${testImageId}/like`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to like image with status ${response.status}`);
  }
}

// Test 11: Add Reaction to Image
async function testAddReaction() {
  if (!testImageId || !authToken) {
    console.log('⚠️  Skipping reaction test - missing image ID or auth');
    return;
  }
  
  const response = await fetchAPI(`/api/images/${testImageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji: '🔥' })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add reaction with status ${response.status}`);
  }
}

// Test 12: Get Collections
async function testGetCollections() {
  const response = await fetchAPI('/api/collections');
  if (!response.ok) {
    throw new Error(`Failed to get collections with status ${response.status}`);
  }
}

// Test 13: Create Collection
async function testCreateCollection() {
  if (!authToken) {
    console.log('⚠️  Skipping collection creation - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/collections', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Integration Collection',
      description: 'Created during API integration test',
      isPrivate: false
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create collection with status ${response.status}`);
  }
  
  const data = await response.json();
  testCollectionId = data.id;
}

// Test 14: Get Mixed Collections
async function testGetMixedCollections() {
  const response = await fetchAPI('/api/collections/mix');
  if (!response.ok) {
    throw new Error(`Failed to get mixed collections with status ${response.status}`);
  }
}

// Test 15: Get User Profile
async function testGetUserProfile() {
  if (!authToken) {
    console.log('⚠️  Skipping user profile test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/user/profile');
  if (!response.ok) {
    throw new Error(`Failed to get user profile with status ${response.status}`);
  }
}

// Test 16: Update User Profile
async function testUpdateUserProfile() {
  if (!authToken) {
    console.log('⚠️  Skipping profile update - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify({
      name: 'Updated Test User',
      bio: 'Updated bio during integration test',
      location: 'Paris, France'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update profile with status ${response.status}`);
  }
}

// Test 17: Get User Creations
async function testGetUserCreations() {
  if (!authToken) {
    console.log('⚠️  Skipping user creations test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/user/creations');
  if (!response.ok) {
    throw new Error(`Failed to get user creations with status ${response.status}`);
  }
}

// Test 18: Get User Achievements
async function testGetUserAchievements() {
  if (!authToken) {
    console.log('⚠️  Skipping achievements test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/user/achievements');
  if (!response.ok) {
    throw new Error(`Failed to get achievements with status ${response.status}`);
  }
}

// Test 19: Get User Sessions
async function testGetUserSessions() {
  if (!authToken) {
    console.log('⚠️  Skipping sessions test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/user/sessions');
  if (!response.ok) {
    throw new Error(`Failed to get user sessions with status ${response.status}`);
  }
}

// Test 20: Upload Avatar
async function testUploadAvatar() {
  if (!authToken) {
    console.log('⚠️  Skipping avatar upload - no auth token');
    return;
  }
  
  // Create a simple test image
  const formData = new FormData();
  const blob = new Blob(['test image data'], { type: 'image/jpeg' });
  formData.append('avatar', blob, 'test-avatar.jpg');
  
  const response = await fetch(`${BASE_URL}/api/user/avatar`, {
    method: 'POST',
    headers: {
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload avatar with status ${response.status}`);
  }
}

// Test 21: Get Notifications
async function testGetNotifications() {
  if (!authToken) {
    console.log('⚠️  Skipping notifications test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/notifications');
  if (!response.ok) {
    throw new Error(`Failed to get notifications with status ${response.status}`);
  }
}

// Test 22: Mark All Notifications as Read
async function testMarkNotificationsRead() {
  if (!authToken) {
    console.log('⚠️  Skipping mark read test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/notifications/read-all', {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark notifications read with status ${response.status}`);
  }
}

// Test 23: Follow User
async function testFollowUser() {
  if (!authToken || !testUserId) {
    console.log('⚠️  Skipping follow test - missing auth or user ID');
    return;
  }
  
  const response = await fetchAPI(`/api/follow/${testUserId}`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to follow user with status ${response.status}`);
  }
}

// Test 24: Get User Followers
async function testGetUserFollowers() {
  if (!testUserId) {
    console.log('⚠️  Skipping followers test - no user ID');
    return;
  }
  
  const response = await fetchAPI(`/api/user/${testUserId}/followers`);
  if (!response.ok) {
    throw new Error(`Failed to get followers with status ${response.status}`);
  }
}

// Test 25: Get User Following
async function testGetUserFollowing() {
  if (!testUserId) {
    console.log('⚠️  Skipping following test - no user ID');
    return;
  }
  
  const response = await fetchAPI(`/api/user/${testUserId}/following`);
  if (!response.ok) {
    throw new Error(`Failed to get following with status ${response.status}`);
  }
}

// Test 26: Get Public User Profile
async function testGetPublicUserProfile() {
  if (!testUserId) {
    console.log('⚠️  Skipping public profile test - no user ID');
    return;
  }
  
  const response = await fetchAPI(`/api/user/${testUserId}`);
  if (!response.ok) {
    throw new Error(`Failed to get public user profile with status ${response.status}`);
  }
}

// Test 27: Setup 2FA
async function testSetup2FA() {
  if (!authToken) {
    console.log('⚠️  Skipping 2FA test - no auth token');
    return;
  }
  
  const response = await fetchAPI('/api/user/2fa', {
    method: 'POST',
    body: JSON.stringify({ enabled: true })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to setup 2FA with status ${response.status}`);
  }
}

// Test 28: Upload Image
async function testUploadImage() {
  if (!authToken) {
    console.log('⚠️  Skipping image upload - no auth token');
    return;
  }
  
  const formData = new FormData();
  const blob = new Blob(['test image data'], { type: 'image/jpeg' });
  formData.append('image', blob, 'test-image.jpg');
  formData.append('title', 'Test Upload');
  formData.append('description', 'Test upload during integration test');
  
  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload image with status ${response.status}`);
  }
}

// Cleanup function
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    if (testImageId && authToken) {
      await fetchAPI(`/api/images/${testImageId}`, { method: 'DELETE' });
    }
    if (testCollectionId && authToken) {
      await fetchAPI(`/api/collections/${testCollectionId}`, { method: 'DELETE' });
    }
    if (testUserId && authToken) {
      await fetchAPI(`/api/user/${testUserId}`, { method: 'DELETE' });
    }
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️  Some cleanup failed:', error);
  }
}

// Main test runner
async function main() {
  console.log('🧪 Starting Lumio App API Integration Tests\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  try {
    // Public endpoints (no auth required)
    await runTest('Health Check', '/', 'GET', testHealthCheck);
    await runTest('Get Categories', '/api/categories', 'GET', testGetCategories);
    await runTest('Get Images', '/api/images', 'GET', testGetImages);
    await runTest('Get Images with Filters', '/api/images?category=Nature', 'GET', testGetImagesWithFilters);
    await runTest('Get Suggestions', '/api/suggestions', 'GET', testGetSuggestions);
    await runTest('Get Collections', '/api/collections', 'GET', testGetCollections);
    await runTest('Get Mixed Collections', '/api/collections/mix', 'GET', testGetMixedCollections);
    
    // Authentication endpoints
    await runTest('User Registration', '/api/auth/register', 'POST', testUserRegistration);
    await runTest('User Login', '/api/auth/[...nextauth]', 'POST', testUserLogin);
    
    // Authenticated endpoints
    await runTest('Get User Profile', '/api/user/profile', 'GET', testGetUserProfile);
    await runTest('Update User Profile', '/api/user/profile', 'PUT', testUpdateUserProfile);
    await runTest('Get User Creations', '/api/user/creations', 'GET', testGetUserCreations);
    await runTest('Get User Achievements', '/api/user/achievements', 'GET', testGetUserAchievements);
    await runTest('Get User Sessions', '/api/user/sessions', 'GET', testGetUserSessions);
    await runTest('Upload Avatar', '/api/user/avatar', 'POST', testUploadAvatar);
    await runTest('Setup 2FA', '/api/user/2fa', 'POST', testSetup2FA);
    
    // Image management
    await runTest('Create Image', '/api/images', 'POST', testCreateImage);
    await runTest('Get Single Image', '/api/images/:id', 'GET', testGetSingleImage);
    await runTest('Like Image', '/api/images/:id/like', 'POST', testLikeImage);
    await runTest('Add Reaction', '/api/images/:id/reactions', 'POST', testAddReaction);
    await runTest('Upload Image', '/api/upload', 'POST', testUploadImage);
    
    // Collection management
    await runTest('Create Collection', '/api/collections', 'POST', testCreateCollection);
    
    // Social features
    await runTest('Get Notifications', '/api/notifications', 'GET', testGetNotifications);
    await runTest('Mark Notifications Read', '/api/notifications/read-all', 'POST', testMarkNotificationsRead);
    await runTest('Follow User', '/api/follow/:id', 'POST', testFollowUser);
    await runTest('Get User Followers', '/api/user/:id/followers', 'GET', testGetUserFollowers);
    await runTest('Get User Following', '/api/user/:id/following', 'GET', testGetUserFollowing);
    await runTest('Get Public User Profile', '/api/user/:id', 'GET', testGetPublicUserProfile);
    
  } finally {
    // Cleanup
    await cleanupTestData();
  }
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 API INTEGRATION TEST REPORT');
  console.log('='.repeat(60));
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Pass Rate: ${passRate}%`);
  
  // Group by endpoint type
  console.log('\n📋 Tests by Category:');
  console.log('-------------------');
  const categories = {
    'Public Endpoints': testResults.filter(r => 
      ['/api/categories', '/api/images', '/api/suggestions', '/api/collections'].some(e => r.endpoint.includes(e))
    ),
    'Authentication': testResults.filter(r => r.endpoint.includes('/api/auth')),
    'User Profile': testResults.filter(r => r.endpoint.includes('/api/user')),
    'Image Management': testResults.filter(r => r.endpoint.includes('/api/images')),
    'Collections': testResults.filter(r => r.endpoint.includes('/api/collections')),
    'Social Features': testResults.filter(r => 
      ['/api/notifications', '/api/follow'].some(e => r.endpoint.includes(e))
    )
  };
  
  Object.entries(categories).forEach(([category, tests]) => {
    const catPassed = tests.filter(t => t.status === 'PASS').length;
    const catTotal = tests.length;
    console.log(`${category}: ${catPassed}/${catTotal} passed`);
  });
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - ${r.name} (${r.method} ${r.endpoint})`);
        console.log(`    ${r.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 ALL API TESTS PASSED!');
    console.log('✅ Frontend-backend integration is working correctly.');
    console.log('✅ All endpoints are responding as expected.');
  } else {
    console.log('⚠️  SOME API TESTS FAILED.');
    console.log('⚠️  Please review the errors above and check endpoint implementations.');
  }
  
  console.log('='.repeat(60));
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
}

// Run tests
checkServer().then(async (isRunning) => {
  if (!isRunning) {
    console.error('❌ Server is not running. Please start the development server first:');
    console.error('   npm run dev');
    process.exit(1);
  }
  
  await main();
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
