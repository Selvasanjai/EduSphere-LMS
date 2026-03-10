const axios = require('axios');
require('dotenv').config();

// Start server first, then run this test
const API_URL = `http://localhost:${process.env.PORT || 5001}`;

async function testRegister() {
  try {
    console.log('Testing Registration...');
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test@123456',
      role: 'student'
    });
    console.log('✅ Registration Success:', response.data);
    return response.data.token;
  } catch (err) {
    console.error('❌ Registration Error:', err.response?.data || err.message);
    throw err;
  }
}

async function testLogin() {
  try {
    console.log('\nTesting Login...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'Test@123456'
    });
    console.log('✅ Login Success:', response.data);
    return response.data.token;
  } catch (err) {
    console.error('❌ Login Error:', err.response?.data || err.message);
  }
}

async function testHealth() {
  try {
    console.log('Testing Health Check...');
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health Check:', response.data);
  } catch (err) {
    console.error('❌ Health Check Error:', err.message);
  }
}

(async () => {
  try {
    await testHealth();
    await testRegister();
    await testLogin();
  } catch (err) {
    console.error('Test failed.');
    process.exit(1);
  }
})();
