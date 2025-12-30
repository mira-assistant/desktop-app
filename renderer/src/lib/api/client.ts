import axios from 'axios';

const PROD_URL = 'https://vyl7ozve5sbobqeg2hbiik3gzu0vqbio.lambda-url.us-east-1.on.aws';
const API_PREFIX = '/api/v2';

// Use dev URL if environment variable is set, otherwise use prod
const baseURL = process.env.NEXT_PUBLIC_DEV_URL
  ? `${process.env.NEXT_PUBLIC_DEV_URL}${API_PREFIX}`
  : `${PROD_URL}${API_PREFIX}`;

// Create the Axios instance
export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});