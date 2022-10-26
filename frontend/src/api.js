import axios from 'axios'
const axiosInstance =  axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://ssi.eecc.de/api/verify' : 'http://localhost:3000/api/verify',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
