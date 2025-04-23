import React from 'react'
import { User, Bot } from 'lucide-react';
import parse from "html-react-parser";
import { cn } from '../ui/utils';

function MessageBubble({ content, isUser }) {
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        isUser ? 'order-2 bg-teal-600' : 'bg-teal-900/50'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-teal-50" />
        ) : (
          <Bot className="w-4 h-4 text-teal-400" />
        )}
      </div>
      <div className={cn(
        "max-w-[85%] break-words rounded-xl p-4 border",
        isUser 
          ? 'order-1 bg-teal-600/20 border-teal-500/30' 
          : 'bg-gray-800/50 border-teal-400/20'
      )}>
        <div className="prose prose-invert text-gray-100">
          {parse(content)}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble

