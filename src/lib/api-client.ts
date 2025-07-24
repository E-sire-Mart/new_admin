import axios from 'axios';
import { getBeSiteURL } from './get-site-url';

const apiClient = axios.create({
  baseURL: getBeSiteURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
