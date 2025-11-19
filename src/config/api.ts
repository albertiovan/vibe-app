/**
 * API Configuration
 * Update NGROK_URL with your current ngrok forwarding URL
 */

// 🔥 UPDATE THIS with your ngrok URL (e.g., https://abc123.ngrok-free.app)
const NGROK_URL = 'https://connectively-unrecurrent-dusti.ngrok-free.dev';

// For production deployment (Railway, Render, etc.)
const PRODUCTION_URL = 'https://your-production-api.com';

// Use ngrok in development, production URL in production builds
export const API_BASE_URL = __DEV__ 
  ? NGROK_URL 
  : PRODUCTION_URL;

export const API_ENDPOINTS = {
  user: `${API_BASE_URL}/api/user`,
  chat: `${API_BASE_URL}/api/chat`,
  activities: `${API_BASE_URL}/api/activities`,
  challenges: `${API_BASE_URL}/api/challenges`,
  weather: `${API_BASE_URL}/api/weather`,
  enrichment: `${API_BASE_URL}/api/enrichment`,
};
