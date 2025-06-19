
import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import { getChatbotResponse } from '../utils/chatbotLogic';
import { Message } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import SearchBar from './search/SearchBar';
import SearchModal from './search/SearchModal';
import PermissionGuard from './auth/PermissionGuard';

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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

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
    
    // Load stored messages
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        // Convert string timestamps to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error('Error loading stored messages:', error);
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

  // Clear highlighted message after a delay
  useEffect(() => {
    if (highlightedMessageId) {
      const timer = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedMessageId]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      setIsSearchModalOpen(true);
    }
  };

  const handleMessageClick = (messageId: string) => {
    setHighlightedMessageId(messageId);
    
    // Find the message element and scroll to it
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
    
    // Update stored messages
    const updatedMessages = messages.filter(message => message.id !== messageId);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
  };

  return (
    <div className={`chat-container ${document.body.classList.contains('dark-mode') ? 'dark-mode' : ''}`}>
      <div className="chat-header">
        <h2>Chat</h2>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search messages..." 
          className="chat-search-bar"
        />
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            id={`message-${message.id}`}
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${
              highlightedMessageId === message.id ? 'highlighted' : ''
            }`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <PermissionGuard permission="delete_messages">
                {message.id !== '1' && (
                  <button 
                    className="delete-message-btn" 
                    onClick={() => handleDeleteMessage(message.id)}
                    title="Delete message"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </PermissionGuard>
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
      
      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        messages={messages}
        onMessageClick={handleMessageClick}
      />
    </div>
  );
};

export default ChatInterface;