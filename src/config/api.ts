/**
 * API Configuration
 * Update NGROK_URL with your current ngrok forwarding URL
 */

// 🔥 UPDATE THIS with your ngrok URL (e.g., https://abc123.ngrok-free.app)
const NGROK_URL = 'https://connectively-unrecurrent-dusti.ngrok-free.dev';

// For standalone builds on same Wi-Fi (your Mac's LAN IP)
const LOCAL_NETWORK_URL = 'http://192.168.88.199:3000';

// For production deployment (EC2)
const PRODUCTION_URL = 'http://3.79.12.161:3000';

// Use EC2 for both dev and production (backend running on AWS)
export const API_BASE_URL = PRODUCTION_URL;

export const API_ENDPOINTS = {
  user: `${API_BASE_URL}/api/user`,
  chat: `${API_BASE_URL}/api/chat`,
  activities: `${API_BASE_URL}/api/activities`,
  challenges: `${API_BASE_URL}/api/challenges`,
  weather: `${API_BASE_URL}/api/weather`,
  enrichment: `${API_BASE_URL}/api/enrichment`,
};
