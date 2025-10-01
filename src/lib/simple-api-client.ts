import axios from 'axios';

// Simple API client for testing
const simpleApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default simpleApiClient;
