const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing PostgreSQL Backend API');
  console.log('==================================\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data);

    // Test 2: Get All Users
    console.log('\n2️⃣ Testing Get All Users...');
    const users = await axios.get(`${BASE_URL}/api/users`);
    const usersData = users.data.data;
    console.log(`✅ Found ${usersData.length} users`);
    console.log('   Sample user:', usersData[0]?.username || 'No users found');

    // Test 3: Get All Blogs
    console.log('\n3️⃣ Testing Get All Blogs...');
    const blogs = await axios.get(`${BASE_URL}/api/blogs`);
    const blogsData = blogs.data.data;
    console.log(`✅ Found ${blogsData.length} blogs`);
    console.log('   Sample blog:', blogsData[0]?.title || 'No blogs found');

    // Test 4: Get User with Blogs
    if (usersData.length > 0) {
      console.log('\n4️⃣ Testing Get User with Blogs...');
      const userWithBlogs = await axios.get(`${BASE_URL}/api/users/${usersData[0].id}?include_blogs=true`);
      const userData = userWithBlogs.data.data;
      console.log(`✅ User "${userData.username}" has ${userData.blogs?.length || 0} blogs`);
    }

    // Test 5: Search Blogs
    console.log('\n5️⃣ Testing Blog Search...');
    const searchResults = await axios.get(`${BASE_URL}/api/blogs?search=web`);
    const searchData = searchResults.data.data;
    console.log(`✅ Search for "web" found ${searchData.length} results`);

    // Test 6: Get Published Blogs Only
    console.log('\n6️⃣ Testing Published Blogs Filter...');
    const publishedBlogs = await axios.get(`${BASE_URL}/api/blogs?published=true`);
    const publishedData = publishedBlogs.data.data;
    console.log(`✅ Found ${publishedData.length} published blogs`);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${usersData.length}`);
    console.log(`   📝 Blogs: ${blogsData.length}`);
    console.log(`   📰 Published: ${publishedData.length}`);
    console.log(`   🔍 Search results: ${searchData.length}`);

  } catch (error) {
    console.log('\n❌ API Test Failed!');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// Run the test
testAPI();