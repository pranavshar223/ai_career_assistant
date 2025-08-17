import React, { useState } from 'react';
import ChatInterface from '../components/Chat/ChatInterface';
import { ChatMessage } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock AI responses - replace with real Gemini API integration
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('data scientist') || lowerMessage.includes('data science')) {
      return `Great choice! Data Science is an exciting field. Based on what you've told me, here's what I'd recommend:

**Skills to Focus On:**
1. **Python** - Essential for data manipulation and ML
2. **Statistics & Mathematics** - Foundation for understanding data
3. **Machine Learning** - Core algorithms and frameworks
4. **SQL** - For database queries and data extraction
5. **Data Visualization** - Communicating insights effectively

**Learning Path:**
- Start with Python fundamentals (4-6 weeks)
- Learn pandas, numpy for data manipulation (3-4 weeks)
- Study statistics and probability (ongoing)
- Build 2-3 portfolio projects

Would you like me to create a detailed roadmap for you? Also, what's your current experience level with programming?`;
    }

    if (lowerMessage.includes('frontend') || lowerMessage.includes('web developer')) {
      return `Frontend development is a fantastic career path! Here's what you need to master:

**Core Technologies:**
1. **HTML/CSS** - Structure and styling
2. **JavaScript** - Programming fundamentals
3. **React/Vue/Angular** - Modern frameworks
4. **Responsive Design** - Mobile-first approach
5. **Version Control** - Git and GitHub

**Additional Skills:**
- TypeScript for better code quality
- Testing frameworks (Jest, Cypress)
- Performance optimization
- Accessibility best practices

**Project Ideas:**
- Personal portfolio website
- E-commerce site
- Task management app

What's your current experience with these technologies?`;
    }

    if (lowerMessage.includes('roadmap') || lowerMessage.includes('learning path')) {
      return `I'd love to create a personalized roadmap for you! To build the most effective plan, I need to understand:

1. **Your Career Goal** - What specific role are you targeting?
2. **Current Skills** - What do you already know?
3. **Experience Level** - Beginner, intermediate, or advanced?
4. **Timeline** - How quickly do you want to achieve your goal?
5. **Learning Style** - Do you prefer courses, books, or hands-on projects?

Once I have this information, I can create a detailed, step-by-step roadmap with:
- Skill priorities and timelines
- Recommended resources
- Project milestones
- Certification suggestions

Tell me about your career goals and current situation!`;
    }

    // Default response
    return `I understand you're looking for career guidance. I'm here to help you with:

• Career path planning and goal setting
• Skill gap analysis and learning recommendations
• Creating personalized roadmaps
• Job market insights and opportunities
• Resume and interview preparation

Could you tell me more about your specific career interests or current challenges? The more details you share, the better I can assist you!`;
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await generateAIResponse(content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Career Assistant</h1>
          <p className="text-gray-600 mt-2">
            Get personalized career guidance powered by AI. Ask about skills, roadmaps, or career planning.
          </p>
        </div>

        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Chat;