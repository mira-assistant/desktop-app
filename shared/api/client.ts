import axios from 'axios';

// Determine API version based on BETA flag
const isBeta = process.env.NEXT_PUBLIC_BETA === 'true';
const API_PREFIX = isBeta ? '/api/v2' : '/api/v1';

// Get API URL from environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const baseURL = `${apiUrl}${API_PREFIX}`;

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});