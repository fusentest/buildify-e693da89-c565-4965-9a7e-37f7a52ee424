
import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import { getChatbotResponse } from '../utils/chatbotLogic';
import { Message } from '../types/chat';
import { useAuth } from '../context/AuthContext';

const ChatInterface: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userPreferences, setUserPreferences] = useState({
    autoScroll: true,
    messageSound: true,
    fontSize: 'medium'
  });

  useEffect(() => {
    // Initialize chat with welcome message when component mounts
    if (currentUser && messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: `Hello ${currentUser.name}! I'm your friendly chatbot. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
    
    // Load user preferences
    if (currentUser) {
      const storedPreferences = localStorage.getItem(`preferences_${currentUser.id}`);
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        setUserPreferences({
          autoScroll: preferences.autoScroll,
          messageSound: preferences.messageSound,
          fontSize: preferences.fontSize
        });
        
        // Apply font size preference
        document.body.setAttribute('data-font-size', preferences.fontSize);
        
        // Apply dark mode if enabled
        if (preferences.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    }
  }, [currentUser, messages.length]);

  const scrollToBottom = () => {
    if (userPreferences.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, userPreferences.autoScroll]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const playMessageSound = () => {
    if (userPreferences.messageSound) {
      // Simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
      } catch (error) {
        console.error('Error playing message sound:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = getChatbotResponse(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      playMessageSound();
    }, 1000);
  };

  return (
    <div className={`chat-container ${document.body.classList.contains('dark-mode') ? 'dark-mode' : ''}`}>
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;