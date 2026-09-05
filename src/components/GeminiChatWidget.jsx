import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessageToAI } from '../services/gemini';
import './GeminiChatWidget.css';

export default function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi there! I am your AI Vet Assistant. 🐾 How can I help you and your pet today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAI(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', content: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gemini-widget-container">
      {isOpen && (
        <div className="gemini-chat-window">
          <div className="gemini-chat-header">
            <h3><Bot size={20} /> AI Vet Assistant</h3>
            <button className="gemini-chat-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="gemini-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`gemini-message ${msg.role}`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="gemini-message ai">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="gemini-chat-input-container">
            <form onSubmit={handleSubmit} className="gemini-chat-form">
              <input
                type="text"
                className="gemini-chat-input"
                placeholder="Ask about diet, symptoms, etc..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="gemini-chat-submit" 
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          className="gemini-toggle-btn" 
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Vet Assistant"
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
}
