import axios from 'axios';

// IMPORTANT: IP address
const API_BASE_URL = 'http://127.0.0.1:5000'; 
// const API_BASE_URL = 'http://192.168.8.65:5000'; 

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;