/**
 * Chat API Routes
 * Real-time conversational interface with AI
 */

import express from 'express';
import { ConversationHistoryService } from '../services/conversation/conversationHistory.js';
import { ContextualPromptsService } from '../services/context/contextualPrompts.js';
import { UserService } from '../services/user/userService.js';
import mcpRecommender from '../services/llm/mcpClaudeRecommender.js';

const router = express.Router();

/**
 * POST /api/chat/start
 * Start a new conversation with contextual greeting
 */
router.post('/start', async (req, res) => {
  try {
    const { deviceId, location, weather } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'device_id_required' });
    }

    // Get or create user
    const userId = await ConversationHistoryService.getOrCreateUser(deviceId);

    // Get user preferences for personalization
    const preferences = await UserService.getPreferences(userId);
    const favoriteCategories = await UserService.getFavoriteCategories(userId);

    // Determine time of day
    const hour = new Date().getHours();
    const timeOfDay = ContextualPromptsService.getTimeOfDay(hour);

    // Generate contextual prompt
    const promptOptions = {
      timeOfDay,
      weather,
      location: location ? {
        city: location.city,
        isNewArea: location.isNew || false
      } : undefined,
      userHistory: {
        favoriteCategories
      }
    };

    const prompt = ContextualPromptsService.generatePrompt(promptOptions);
    const suggestedVibes = ContextualPromptsService.getSuggestedVibes(promptOptions);

    // Create conversation
    const conversationId = await ConversationHistoryService.createConversation(userId, {
      location,
      weather,
      time: new Date().toISOString()
    });

    res.json({
      conversationId,
      greeting: {
        text: `${prompt.greeting} ${prompt.suggestion}`,
        emoji: prompt.emoji
      },
      suggestedVibes,
      userPreferences: preferences
    });

  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * POST /api/chat/message
 * Send a message and get AI response with recommendations
 */
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message, location } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversation_id_and_message_required' });
    }

    // Add user message to history
    await ConversationHistoryService.addMessage(conversationId, 'user', message);

    // Get conversation context
    const conversation = await ConversationHistoryService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'conversation_not_found' });
    }

    // If this is the first message, generate a title
    if (conversation.messages?.length === 1) {
      const title = ConversationHistoryService.generateTitle(message);
      await ConversationHistoryService.updateConversationTitle(conversationId, title);
    }

    // Detect vibe state from user message
    const vibeState = ContextualPromptsService.detectVibeState(message);
    await ConversationHistoryService.updateVibeState(conversationId, vibeState);

    // Get AI recommendations using the MCP recommender
    const recommendations = await mcpRecommender.getMCPRecommendations({
      vibe: message,
      city: location?.city || 'Bucharest'
    });

    // Generate response text based on vibe state and results
    let responseText = "Here's what I found for you!";
    if (vibeState === 'excited') {
      responseText = "Let's get out there! Here are some great options:";
    } else if (vibeState === 'romantic') {
      responseText = "Perfect for a special time together:";
    } else if (vibeState === 'adventurous') {
      responseText = "Ready for an adventure? Check these out:";
    } else if (vibeState === 'calm') {
      responseText = "Here are some relaxing options:";
    }

    const aiResponse = {
      text: responseText,
      activities: recommendations.ideas,
      vibeState
    };

    // Save AI response to history
    await ConversationHistoryService.addMessage(
      conversationId,
      'assistant',
      aiResponse.text,
      {
        activities: aiResponse.activities,
        vibeState
      }
    );

    res.json({
      response: aiResponse.text,
      activities: aiResponse.activities,
      vibeState,
      conversationId
    });

  } catch (error) {
    console.error('❌ Chat message error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      conversationId: req.body.conversationId,
      messageLength: req.body.message?.length
    });
    res.status(500).json({ 
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/chat/history
 * Get recent conversations for a user
 */
router.get('/history', async (req, res) => {
  try {
    const { deviceId, limit = 10 } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'device_id_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId as string);
    const conversations = await ConversationHistoryService.getRecentConversations(
      userId,
      parseInt(limit as string)
    );

    res.json({ conversations });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * GET /api/chat/conversation/:id
 * Get full conversation with all messages
 */
router.get('/conversation/:id', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const conversation = await ConversationHistoryService.getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'conversation_not_found' });
    }

    res.json({ conversation });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

export default router;
