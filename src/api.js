import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || '',
});

export default API;
