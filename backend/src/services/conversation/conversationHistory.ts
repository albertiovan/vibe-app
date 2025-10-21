/**
 * Conversation History Service
 * Manages chat conversations and message history
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at: Date;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string | null;
  vibe_state: string | null;
  created_at: Date;
  updated_at: Date;
  messages?: Message[];
}

export class ConversationHistoryService {
  /**
   * Get or create a user by device ID
   */
  static async getOrCreateUser(deviceId: string): Promise<number> {
    const result = await pool.query(
      `INSERT INTO users (device_id) 
       VALUES ($1) 
       ON CONFLICT (device_id) 
       DO UPDATE SET last_active_at = NOW() 
       RETURNING id`,
      [deviceId]
    );
    return result.rows[0].id;
  }

  /**
   * Create a new conversation
   */
  static async createConversation(
    userId: number,
    context?: { location?: any; weather?: any; time?: string }
  ): Promise<number> {
    const result = await pool.query(
      `INSERT INTO conversations (user_id, context) 
       VALUES ($1, $2) 
       RETURNING id`,
      [userId, JSON.stringify(context || {})]
    );
    return result.rows[0].id;
  }

  /**
   * Add a message to a conversation
   */
  static async addMessage(
    conversationId: number,
    role: 'user' | 'assistant',
    content: string,
    metadata?: any
  ): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, role, content, metadata) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, conversation_id, role, content, metadata, created_at`,
      [conversationId, role, content, JSON.stringify(metadata || {})]
    );
    return result.rows[0];
  }

  /**
   * Update conversation title (auto-generated from first message)
   */
  static async updateConversationTitle(conversationId: number, title: string): Promise<void> {
    await pool.query(
      `UPDATE conversations SET title = $1 WHERE id = $2`,
      [title, conversationId]
    );
  }

  /**
   * Update conversation vibe state
   */
  static async updateVibeState(
    conversationId: number,
    vibeState: 'calm' | 'excited' | 'romantic' | 'adventurous'
  ): Promise<void> {
    await pool.query(
      `UPDATE conversations SET vibe_state = $1 WHERE id = $2`,
      [vibeState, conversationId]
    );
  }

  /**
   * Get recent conversations for a user
   */
  static async getRecentConversations(
    userId: number,
    limit: number = 10
  ): Promise<Conversation[]> {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.user_id, 
        c.title, 
        c.vibe_state, 
        c.created_at, 
        c.updated_at,
        (
          SELECT json_agg(
            json_build_object(
              'id', m.id,
              'role', m.role,
              'content', m.content,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          LIMIT 5
        ) as messages
       FROM conversations c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  /**
   * Get full conversation with all messages
   */
  static async getConversation(conversationId: number): Promise<Conversation | null> {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.user_id, 
        c.title, 
        c.vibe_state, 
        c.created_at, 
        c.updated_at,
        (
          SELECT json_agg(
            json_build_object(
              'id', m.id,
              'role', m.role,
              'content', m.content,
              'metadata', m.metadata,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC
          )
          FROM messages m
          WHERE m.conversation_id = c.id
        ) as messages
       FROM conversations c
       WHERE c.id = $1`,
      [conversationId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get conversation messages for context
   */
  static async getConversationContext(conversationId: number, limit: number = 10): Promise<Message[]> {
    const result = await pool.query(
      `SELECT id, role, content, metadata, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [conversationId, limit]
    );
    return result.rows.reverse(); // Chronological order
  }

  /**
   * Generate a title from the first user message
   */
  static generateTitle(firstMessage: string): string {
    // Take first 50 chars and add emoji based on content
    const truncated = firstMessage.substring(0, 50);
    
    // Add contextual emoji
    if (/food|eat|restaurant|drink/i.test(firstMessage)) {
      return `🍜 ${truncated}`;
    } else if (/adventure|hike|outdoor/i.test(firstMessage)) {
      return `🏔️ ${truncated}`;
    } else if (/date|romantic/i.test(firstMessage)) {
      return `🍷 ${truncated}`;
    } else if (/social|friends|party/i.test(firstMessage)) {
      return `🎉 ${truncated}`;
    } else {
      return `💬 ${truncated}`;
    }
  }

  /**
   * Delete old conversations (cleanup)
   */
  static async deleteOldConversations(userId: number, olderThanDays: number = 90): Promise<number> {
    const result = await pool.query(
      `DELETE FROM conversations 
       WHERE user_id = $1 
       AND updated_at < NOW() - INTERVAL '${olderThanDays} days'`,
      [userId]
    );
    return result.rowCount || 0;
  }
}
