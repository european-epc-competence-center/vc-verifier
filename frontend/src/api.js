import axios from 'axios'
const axiosInstance =  axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.VERIFIER_API : 'http://localhost:3000/api/verifier',
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
