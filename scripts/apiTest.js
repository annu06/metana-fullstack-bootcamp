const axios = require('axios');
const baseURL = 'http://localhost:3000/api';

async function runTests() {
  try {
    // 1. Get all users
    let res = await axios.get(`${baseURL}/users`);
    console.log('GET /users:', res.data);
    const userId = res.data[0]?._id;

    // 2. Create a new user
    res = await axios.post(`${baseURL}/users`, {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'password123',
    });
    console.log('POST /users:', res.data);
    const newUserId = res.data._id;

    // 3. Update the new user
    res = await axios.put(`${baseURL}/users/${newUserId}`, {
      name: 'Charlie Updated'
    });
    console.log('PUT /users/:id:', res.data);

    // 4. Get user by ID
    res = await axios.get(`${baseURL}/users/${newUserId}`);
    console.log('GET /users/:id:', res.data);

    // 5. Delete the new user
    res = await axios.delete(`${baseURL}/users/${newUserId}`);
    console.log('DELETE /users/:id:', res.data);

    // 6. Get all blogs
    res = await axios.get(`${baseURL}/blogs`);
    console.log('GET /blogs:', res.data);
    const blogUserId = userId || newUserId;

    // 7. Create a new blog
    res = await axios.post(`${baseURL}/blogs`, {
      title: 'Automated Blog',
      content: 'This blog was created by an automated test.',
      user: blogUserId
    });
    console.log('POST /blogs:', res.data);
    const newBlogId = res.data._id;

    // 8. Update the new blog
    res = await axios.put(`${baseURL}/blogs/${newBlogId}`, {
      title: 'Automated Blog Updated'
    });
    console.log('PUT /blogs/:id:', res.data);

    // 9. Get blog by ID
    res = await axios.get(`${baseURL}/blogs/${newBlogId}`);
    console.log('GET /blogs/:id:', res.data);

    // 10. Delete the new blog
    res = await axios.delete(`${baseURL}/blogs/${newBlogId}`);
    console.log('DELETE /blogs/:id:', res.data);

    console.log('All API tests completed successfully!');
  } catch (err) {
    console.error('--- ERROR DETAILS ---');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
      console.error('Data:', err.response.data);
    } else if (err.request) {
      console.error('No response received. Request:', err.request);
    } else {
      console.error('Error Message:', err.message);
    }
    console.error('Stack:', err.stack);
  }
}

runTests();
