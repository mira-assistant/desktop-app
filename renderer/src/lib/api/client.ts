import axios from 'axios';
import { API_CONFIG } from './constants';

const baseURL = API_CONFIG.DEV_URL + API_CONFIG.API_PREFIX;

// Create the Axios instance
export const api = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUTS.DEFAULT,
  headers: {
    'Content-Type': 'application/json',
  },
});