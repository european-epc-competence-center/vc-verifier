import axios from 'axios'
const axiosInstance = axios.create({
  baseURL: process.env.VERIFIER_API || 'http://localhost:3000/api/verifier',
  timeout: 5000,
  headers: {
    'Accept': 'application/ld+json,application/json,*/*'
  },
});

export default axiosInstance;
