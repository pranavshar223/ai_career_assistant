const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  metadata: {
    extractedSkills: [String],
    extractedGoals: [String],
    sentiment: String,
    confidence: Number
  },
  tokens: {
    input: Number,
    output: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);