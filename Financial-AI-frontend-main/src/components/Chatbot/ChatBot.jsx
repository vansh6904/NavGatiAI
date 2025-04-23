import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { marked } from "marked";
import { Send, Loader2, User, Bot } from 'lucide-react';
import { Input } from './Input';
import Button from '../Microfinance/Button';
import { cn } from '../ui/utils';
import MessageBubble from './MessageBubble';

function ChatBot() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { content: inputValue, isUser: true }]);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/chatbot/ask`, {
        question: inputValue,
      });

      const answer = marked(res.data.answer);
      setMessages(prev => [...prev, { content: answer, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        content: "⚠️ Error communicating with the server. Please try again.",
        isUser: false
      }]);
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Messages container with corrected height calculation */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] p-4">
            <Bot className="w-12 h-12 mb-4 text-teal-400" />
            <p className="text-teal-300 text-lg font-medium">How can I assist you today?</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4 pb-24">
            {messages.map((message, index) => (
              <MessageBubble key={index} content={message.content} isUser={message.isUser} />
            ))}
            {loading && (
              <div className="flex items-start gap-3 animate-pulse">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-900/50">
                  <Bot className="w-4 h-4 text-teal-400" />
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-teal-400/20">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Fixed input area */}
      <div className="border-t border-gray-700/50 bg-gray-900/30 backdrop-blur-sm fixed bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto w-full px-4 py-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 bg-gray-800/50 border-gray-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 text-gray-100 placeholder-gray-400 text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className={cn(
                "w-10 h-10 p-0 bg-gradient-to-r from-teal-600 to-cyan-600",
                "hover:from-teal-500 hover:to-cyan-500 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;