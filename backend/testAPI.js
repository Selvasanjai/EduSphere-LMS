require('dotenv').config();
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing login API...');

    // Test login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'test@example.com',
        password: 'test123',
      }
    );

    console.log('Login response:', loginResponse.data);

    // Test register
    const registerResponse = await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        name: 'Test User',
        email: 'test2@example.com',
        password: 'test123',
        role: 'student',
      }
    );

    console.log('Register response:', registerResponse.data);

    // Test health
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('Health response:', healthResponse.data);
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
}

testAPI();
