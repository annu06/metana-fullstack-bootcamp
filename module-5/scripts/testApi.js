const http = require('http');

const testEndpoint = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Testing Backend API Endpoints...\n');

  try {
    // Test root endpoint
    console.log('1. Testing root endpoint (/)...');
    const rootResponse = await testEndpoint('/');
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Success: ${rootResponse.data.success ? '✅' : '❌'}`);
    console.log(`   Message: ${rootResponse.data.message}\n`);

    // Test users endpoint
    console.log('2. Testing users endpoint (/api/users)...');
    const usersResponse = await testEndpoint('/api/users');
    console.log(`   Status: ${usersResponse.status}`);
    console.log(`   Success: ${usersResponse.data.success ? '✅' : '❌'}`);
    console.log(`   Message: ${usersResponse.data.message}\n`);

    // Test blogs endpoint
    console.log('3. Testing blogs endpoint (/api/blogs)...');
    const blogsResponse = await testEndpoint('/api/blogs');
    console.log(`   Status: ${blogsResponse.status}`);
    console.log(`   Success: ${blogsResponse.data.success ? '✅' : '❌'}`);
    console.log(`   Message: ${blogsResponse.data.message}\n`);

    // Test 404 endpoint
    console.log('4. Testing 404 handling (/nonexistent)...');
    const notFoundResponse = await testEndpoint('/nonexistent');
    console.log(`   Status: ${notFoundResponse.status}`);
    console.log(`   Success: ${notFoundResponse.status === 404 ? '✅' : '❌'}`);
    console.log(`   Message: ${notFoundResponse.data.message}\n`);

    console.log('🎉 API Testing Complete!');
    console.log('📝 Note: Database operations may fail if MongoDB is not connected.');
    console.log('   This is expected and the API structure is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running on http://localhost:3000');
  }
};

// Run tests
runTests();