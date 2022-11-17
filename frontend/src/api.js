import axios from 'axios'
const axiosInstance =  axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.VERIFIER_API : 'https://ssi.eecc.de/api/verifier',
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
