import React, { useState } from "react";
import ChatInterface from "../components/Chat/ChatInterface";
import { ChatMessage } from "../types";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock AI responses - replace with real Gemini API integration
const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:5000/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage }),
    });
    const data = await response.json(); 
    return data.reply || "Sorry, I couldn't get a response from the AI.";
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Sorry, I couldn't connect to the AI service.";
  }
};

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await generateAIResponse(content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Career Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            Get personalized career guidance powered by AI. Ask about skills,
            roadmaps, or career planning.
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
