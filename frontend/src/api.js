// Global API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://edusphere-api.onrender.com/api'  // Your live Render backend URL
  : 'http://localhost:5000/api';

export default API_BASE_URL;
