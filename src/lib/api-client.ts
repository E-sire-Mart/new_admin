import axios from 'axios';
import { getBESiteURL } from './get-site-url';

const apiClient = axios.create({
  baseURL: getBESiteURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
