// Global API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? '/api'  // Use relative path in production
    : 'http://localhost:5001/api');

export default API_BASE_URL;
