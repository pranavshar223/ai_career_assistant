const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const auth = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// @route   POST /api/chat/message
// @desc    Send message to AI and get response
// @access  Private
router.post('/message', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, sessionId = `session_${Date.now()}` } = req.body;
    const userId = req.user._id;

    // Save user message
    const userMessage = new ChatMessage({
      userId,
      sessionId,
      content,
      role: 'user'
    });
    await userMessage.save();

    // Get chat history for context
    const chatHistory = await ChatMessage.find({
      userId,
      sessionId
    }).sort({ createdAt: 1 }).limit(10);

    // Get user profile for context
    const user = await User.findById(userId);

    // Generate AI response
    const aiResponse = await geminiService.generateResponse(content, {
      chatHistory: chatHistory.slice(0, -1), // Exclude the current message
      userProfile: {
        background: user.background,
        skills: user.skills,
        careerGoals: user.careerGoals,
        preferences: user.preferences
      }
    });

    // Save AI response
    const assistantMessage = new ChatMessage({
      userId,
      sessionId,
      content: aiResponse.content,
      role: 'assistant',
      metadata: aiResponse.metadata,
      tokens: aiResponse.tokens
    });
    await assistantMessage.save();

    // Update user streak if this is a meaningful interaction
    if (content.length > 10) {
      user.updateStreak();
      await user.save();
    }

    // Extract and update user skills/goals if AI detected any
    if (aiResponse.metadata?.extractedSkills?.length > 0) {
      await updateUserSkills(userId, aiResponse.metadata.extractedSkills);
    }

    if (aiResponse.metadata?.extractedGoals?.length > 0) {
      await updateUserGoals(userId, aiResponse.metadata.extractedGoals);
    }

    res.json({
      message: 'Message processed successfully',
      response: {
        id: assistantMessage._id,
        content: assistantMessage.content,
        role: assistantMessage.role,
        timestamp: assistantMessage.createdAt,
        sessionId
      },
      metadata: aiResponse.metadata
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      message: 'Error processing chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chat/history/:sessionId
// @desc    Get chat history for a session
// @access  Private
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({
      userId: req.user._id,
      sessionId
    })
    .sort({ createdAt: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await ChatMessage.countDocuments({
      userId: req.user._id,
      sessionId
    });

    res.json({
      messages: messages.map(msg => ({
        id: msg._id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.createdAt,
        metadata: msg.metadata
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      message: 'Error fetching chat history'
    });
  }
});

// @route   GET /api/chat/sessions
// @desc    Get all chat sessions for user
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $last: '$content' },
          lastActivity: { $last: '$createdAt' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastActivity: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      sessions: sessions.map(session => ({
        sessionId: session._id,
        lastMessage: session.lastMessage.substring(0, 100) + (session.lastMessage.length > 100 ? '...' : ''),
        lastActivity: session.lastActivity,
        messageCount: session.messageCount
      }))
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      message: 'Error fetching chat sessions'
    });
  }
});

// Helper function to update user skills
async function updateUserSkills(userId, extractedSkills) {
  try {
    const user = await User.findById(userId);
    const existingSkills = user.skills.map(s => s.name.toLowerCase());
    
    const newSkills = extractedSkills
      .filter(skill => !existingSkills.includes(skill.toLowerCase()))
      .map(skill => ({
        name: skill,
        level: 'beginner',
        category: 'general',
        addedAt: new Date()
      }));

    if (newSkills.length > 0) {
      user.skills.push(...newSkills);
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user skills:', error);
  }
}

// Helper function to update user goals
async function updateUserGoals(userId, extractedGoals) {
  try {
    const user = await User.findById(userId);
    const existingGoals = user.careerGoals.map(g => g.title.toLowerCase());
    
    const newGoals = extractedGoals
      .filter(goal => !existingGoals.includes(goal.toLowerCase()))
      .map(goal => ({
        title: goal,
        description: `Goal identified from chat conversation`,
        priority: 'medium',
        completed: false
      }));

    if (newGoals.length > 0) {
      user.careerGoals.push(...newGoals);
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user goals:', error);
  }
}

module.exports = router;