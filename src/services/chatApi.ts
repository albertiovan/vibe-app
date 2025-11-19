/**
 * Chat API Service
 * Frontend interface for conversational AI
 */

import Constants from 'expo-constants';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL + '/api';

export interface ChatStartResponse {
  conversationId: number;
  greeting: {
    text: string;
    emoji: string;
  };
  suggestedVibes: string[];
  userPreferences: any;
}

export interface ChatMessageResponse {
  response: string;
  activities: any[];
  vibeState: 'calm' | 'excited' | 'romantic' | 'adventurous';
  conversationId: number;
}

export interface Conversation {
  id: number;
  title: string;
  vibe_state: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at: string;
}

class ChatApiService {
  /**
   * Start a new conversation
   */
  async startConversation(params: {
    deviceId: string;
    location?: { city: string; lat: number; lng: number; isNew?: boolean };
    weather?: { condition: string; temperature: number };
  }): Promise<ChatStartResponse> {
    const response = await fetch(`${API_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }

    return response.json();
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(params: {
    conversationId: number;
    message: string;
    location?: { city: string; lat: number; lng: number };
    filters?: any; // Activity filters
  }): Promise<ChatMessageResponse> {
    console.log('🚀 Sending message to API:', { 
      url: `${API_URL}/chat/message`,
      params 
    });
    
    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Failed to send message: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  }

  /**
   * Get conversation history for a user
   */
  async getHistory(deviceId: string, limit: number = 10): Promise<{ conversations: Conversation[] }> {
    const response = await fetch(
      `${API_URL}/chat/history?deviceId=${encodeURIComponent(deviceId)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to get history');
    }

    return response.json();
  }

  /**
   * Get full conversation with all messages
   */
  async getConversation(conversationId: number): Promise<{ conversation: Conversation }> {
    const response = await fetch(`${API_URL}/chat/conversation/${conversationId}`);

    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }

    return response.json();
  }
}

export const chatApi = new ChatApiService();
