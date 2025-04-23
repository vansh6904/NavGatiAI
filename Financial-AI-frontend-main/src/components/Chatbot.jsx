import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your financial advisor bot. How can I help you with your finances today?",
      isUserMessage: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const [chatSession, setChatSession] = useState(null);

  // Initialize Gemini AI
  useEffect(() => {
    const initializeGemini = async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: `
            You are a financial advisor skilled at providing comprehensive, easy-to-understand answers tailored to users.
            Your goal is to address questions effectively by giving response, using simple terms, practical examples, and insights when necessary.
            Focus on clarity, and present the answer in structured bullet points for better readability and understanding.
            Always format your core answers using bullet points (* point 1, * point 2, etc.).
            Keep explanations simple and avoid overly technical jargon unless necessary, in which case, explain it simply.
            Be helpful and empathetic.
          `,
        });

        const session = model.startChat();
        setChatSession(session);
      } catch (error) {
        console.error("Error initializing Gemini:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Error initializing the chatbot. Please check the API key and configuration.",
            isUserMessage: false,
          },
        ]);
      }
    };

    initializeGemini();
  }, []);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !chatSession) return;

    const userMessage = inputText.trim();
    setMessages((prev) => [...prev, { text: userMessage, isUserMessage: true }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage(userMessage);
      const botResponse = response.response.text();

      if (botResponse) {
        setMessages((prev) => [...prev, { text: botResponse, isUserMessage: false }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I couldn't generate a response. Please try again.",
            isUserMessage: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, an error occurred while fetching the response. Please try again later.",
            isUserMessage: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single message bubble
  const renderMessageBubble = (message, index) => {
    const isUserMessage = message.isUserMessage;
    return (
      <div
        key={index}
        className={`flex ${isUserMessage ? "justify-end" : "justify-start"} mb-2`}
      >
        <div
          className={`p-3 rounded-lg shadow-md ${
            isUserMessage ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
          style={{ maxWidth: "75%" }}
        >
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-lg font-bold">
        Financial Advisor Chatbot
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-100"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {messages.map((message, index) => renderMessageBubble(message, index))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-300">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              chatSession
                ? "Ask a financial question..."
                : "Initializing chatbot..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!chatSession || isLoading}
          />
          <button
            className={`ml-2 px-4 py-2 rounded-lg text-white ${
              isLoading || !chatSession
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={sendMessage}
            disabled={!chatSession || isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;