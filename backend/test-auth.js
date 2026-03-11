const axios = require('axios');
require('dotenv').config();

// Start server first, then run this test
const API_URL = `http://localhost:${process.env.PORT || 5001}`;

async function testRegister() {
  try {
    console.log('Testing Registration...');
    const userEmail = `test${Date.now()}@example.com`;
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Test User',
      email: userEmail,
      password: 'Test@123456',
      role: 'student',
    });
    console.log('✅ Registration Success:', response.data);
    return userEmail; // Return the email for the login test
  } catch (err) {
    console.error('❌ Registration Error:', err.response?.data || err.message);
    throw err;
  }
}

async function testLogin(email) {
  try {
    console.log('\nTesting Login...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: email, // Use the email from the registration step
      password: 'Test@123456',
    });
    console.log('✅ Login Success:', response.data);
    // The token might be directly in response.data or nested in response.data.data
    const token = response.data.token || (response.data.data && response.data.data.token);
    return token;
  } catch (err) {
    console.error('❌ Login Error:', err.response?.data || err.message);
    throw err;
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

async function testProtectedRoute(token) {
  try {
    console.log('\nTesting Protected Route...');
    // This is an example protected route. Update if yours is different.
    const response = await axios.get(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Protected Route Success:', response.data);
  } catch (err) {
    console.error('❌ Protected Route Error:', err.response?.data || err.message);
    throw err;
  }
}

(async () => {
  try {
    await testHealth();
    const userEmail = await testRegister();
    const token = await testLogin(userEmail);
    await testProtectedRoute(token);
  } catch (err) {
    console.error('Test failed.');
    process.exit(1);
  }
})();
