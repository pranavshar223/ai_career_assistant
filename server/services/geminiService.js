const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';
  }

  /**
   * Generates a Gemini AI response for a user's message and context.
   * @param {string} userMessage - The user's input message.
   * @param {object} context - Additional context (chatHistory, userProfile).
   * @returns {Promise<object>} - AI response, metadata, and token estimates.
   */
  async generateResponse(userMessage, context = {}) {
    if (!this.apiKey) {
      // Fallback to mock response for development
      return this.generateMockResponse(userMessage, context);
    }

    const prompt = this.buildPrompt(userMessage, context);

    try {
      const apiResponse = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const aiText = apiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      const metadata = this.extractMetadata(userMessage, aiText);

      return {
        content: aiText,
        metadata,
        tokens: {
          input: this.estimateTokens(prompt),
          output: this.estimateTokens(aiText)
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      // Fallback to mock response
      return this.generateMockResponse(userMessage, context);
    }
  }

  /**
   * Builds the prompt for Gemini API using user message and context.
   */
  buildPrompt(userMessage, context) {
    const { chatHistory = [], userProfile = {} } = context;

    let prompt = `You are a Personalized AI Career Advisor for Indian students.

User Profile:
- Background: ${userProfile.background || 'Not specified'}
- Current Skills: ${userProfile.skills?.map(s => `${s.name} (${s.level})`).join(', ') || 'None specified'}
- Career Goals: ${userProfile.careerGoals?.map(g => g.title).join(', ') || 'None specified'}

`;

    if (chatHistory.length > 0) {
      prompt += `Recent Conversation:\n`;
      chatHistory.slice(-5).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    prompt += `Current User Message: ${userMessage}

Goal: Help users identify skill gaps, track learning progress, and recommend career paths with actionable steps.

Responsibilities:
1. Analyze the user’s skills, education, and goals.
2. Identify missing skills required for their desired career.
3. Recommend a skill development roadmap with courses, tools, and practice projects.
4. Suggest ways to track progress and milestones.
5. Provide relevant career opportunities, certifications, and internships.

Rules:
- Only respond in the context of skill gaps, progress tracking, and career guidance.
- Keep answers structured, concise, and actionable.
- Ask clarifying questions if the input is incomplete.
- Never output unrelated information.

Example:
Input: "I’m a final-year B.Tech IT student, skilled in HTML, CSS, and basic JavaScript, aiming for a full-stack developer role."
Output:
Career Path Recommendation: Full-Stack Web Developer
Skill Gaps:
1. Backend Development (Node.js/Express)
2. Database Management (MongoDB, SQL)
3. API Development & Integration
4. Deployment (Docker, CI/CD)
Action Plan:
- Learn Node.js & Express from "The Odin Project"
- Practice building REST APIs
- Build a MERN stack project (e.g., Task Manager App)
Progress Tracking:
- Weekly coding hours log
- GitHub commit activity
- Monthly project reviews
Opportunities:
- Apply for internships at startups
- Earn AWS Cloud Practitioner Certification

Keep responses conversational, encouraging, and actionable.`;

    return prompt;
  }

  /**
   * Extracts metadata such as skills, goals, and sentiment from the conversation.
   */
  extractMetadata(userMessage, aiResponse) {
    const metadata = {
      extractedSkills: [],
      extractedGoals: [],
      sentiment: 'neutral',
      confidence: 0.8
    };

    // Simple keyword extraction for skills
    const skillKeywords = [
      'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'mongodb',
      'machine learning', 'data science', 'artificial intelligence', 'ai',
      'web development', 'frontend', 'backend', 'full stack', 'devops',
      'cloud computing', 'aws', 'azure', 'docker', 'kubernetes',
      'project management', 'agile', 'scrum', 'leadership', 'communication'
    ];

    const goalKeywords = [
      'data scientist', 'software engineer', 'web developer', 'product manager',
      'devops engineer', 'machine learning engineer', 'ai engineer',
      'frontend developer', 'backend developer', 'full stack developer',
      'cloud architect', 'cybersecurity specialist', 'mobile developer'
    ];

    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Extract skills mentioned in user message or AI response
    skillKeywords.forEach(skill => {
      if (lowerMessage.includes(skill) || lowerResponse.includes(skill)) {
        metadata.extractedSkills.push(skill);
      }
    });

    // Extract career goals mentioned
    goalKeywords.forEach(goal => {
      if (lowerMessage.includes(goal) || lowerResponse.includes(goal)) {
        metadata.extractedGoals.push(goal);
      }
    });

    // Simple sentiment analysis
    const positiveWords = ['excited', 'interested', 'want to learn', 'passionate', 'love', 'enjoy'];
    const negativeWords = ['struggling', 'difficult', 'confused', 'stuck', 'frustrated'];

    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

    if (positiveCount > negativeCount) {
      metadata.sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      metadata.sentiment = 'negative';
    }

    return metadata;
  }

  /**
   * Generates a mock response for development or fallback.
   */
  generateMockResponse(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerMessage.includes('data scientist') || lowerMessage.includes('data science')) {
      response = `Great choice! Data Science is an exciting field with lots of opportunities. Based on your interest, here's what I'd recommend:

**Essential Skills to Focus On:**
1. **Python** - The most popular language for data science
2. **Statistics & Mathematics** - Foundation for understanding data patterns
3. **Machine Learning** - Core algorithms and frameworks like scikit-learn
4. **SQL** - For database queries and data extraction
5. **Data Visualization** - Tools like Matplotlib, Seaborn, or Tableau

**Learning Path:**
- Start with Python fundamentals (4-6 weeks)
- Learn pandas and numpy for data manipulation (3-4 weeks)
- Study statistics and probability theory (ongoing)
- Build 2-3 portfolio projects to showcase your skills

**Project Ideas:**
- Analyze a dataset from Kaggle
- Build a predictive model for house prices
- Create a data dashboard with visualizations

Would you like me to create a detailed roadmap for you? Also, what's your current experience level with programming and mathematics?`;
    } else if (lowerMessage.includes('frontend') || lowerMessage.includes('web developer')) {
      response = `Frontend development is a fantastic career path! Here's what you need to master:

**Core Technologies:**
1. **HTML/CSS** - Structure and styling fundamentals
2. **JavaScript** - Programming logic and interactivity
3. **React/Vue/Angular** - Modern frontend frameworks
4. **Responsive Design** - Mobile-first development approach
5. **Version Control** - Git and GitHub for collaboration

**Additional Skills:**
- TypeScript for better code quality and maintainability
- Testing frameworks (Jest, Cypress) for reliable code
- Performance optimization techniques
- Web accessibility best practices
- Basic design principles and UX understanding

**Project Portfolio Ideas:**
- Personal portfolio website
- E-commerce site with shopping cart
- Task management application
- Weather app with API integration

What's your current experience with these technologies? I can help create a personalized learning roadmap based on your background!`;
    } else if (lowerMessage.includes('roadmap') || lowerMessage.includes('learning path')) {
      response = `I'd love to create a personalized roadmap for you! To build the most effective plan, I need to understand:

**About Your Goals:**
1. What specific role are you targeting? (e.g., Data Scientist, Frontend Developer, Product Manager)
2. What industry interests you most?
3. Are you looking for entry-level or advanced positions?

**About Your Background:**
1. What's your current experience level?
2. What skills do you already have?
3. What's your educational background?

**About Your Timeline:**
1. How quickly do you want to achieve your goal?
2. How many hours per week can you dedicate to learning?
3. Do you prefer self-paced learning or structured courses?

Once I have this information, I can create a detailed, step-by-step roadmap with:
- Prioritized skill development plan
- Recommended resources and courses
- Project milestones to build your portfolio
- Certification suggestions
- Timeline with realistic deadlines

Tell me about your career aspirations and current situation!`;
    } else {
      response = `I'm here to help you with your career development! I can assist you with:

**Career Planning:**
• Identifying career paths that match your interests and skills
• Creating personalized learning roadmaps
• Setting realistic goals and timelines

**Skill Development:**
• Analyzing skill gaps for your target role
• Recommending learning resources and courses
• Suggesting hands-on projects to build your portfolio

**Job Market Insights:**
• Understanding industry trends and requirements
• Preparing for interviews and technical assessments
• Building a strong professional profile

**Ongoing Support:**
• Tracking your learning progress
• Adjusting your roadmap as you grow
• Providing motivation and accountability

What specific aspect of your career would you like to focus on? Whether you're just starting out, looking to switch careers, or aiming for advancement, I'm here to guide you through the process!`;
    }

    const metadata = this.extractMetadata(userMessage, response);

    return {
      content: response,
      metadata,
      tokens: {
        input: this.estimateTokens(userMessage),
        output: this.estimateTokens(response)
      }
    };
  }

  /**
   * Estimates token count (roughly 4 characters per token).
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
}
module.exports = new GeminiService();

