import axios from 'axios'
const axiosInstance =  axios.create({
  baseURL: process.env.VERIFIER_API || 'https://ssi.eecc.de/api/verifier',
  timeout: 5000,
  headers: {
    'Accept': 'application/ld+json,application/json,*/*'
  },
});

export default axiosInstance;
