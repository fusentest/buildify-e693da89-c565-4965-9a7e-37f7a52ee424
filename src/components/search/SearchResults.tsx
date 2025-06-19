
import React from 'react';
import { Message } from '../../types/chat';
import './SearchResults.css';

interface SearchResultsProps {
  results: Message[];
  query: string;
  onMessageClick: (messageId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  query, 
  onMessageClick 
}) => {
  // Function to highlight the search query in the message text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index}>{part}</mark> 
        : part
    );
  };

  if (results.length === 0) {
    return (
      <div className="search-results-empty">
        <p>No messages found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h3>Search Results ({results.length})</h3>
      </div>
      
      <div className="search-results-list">
        {results.map((message) => (
          <div 
            key={message.id} 
            className={`search-result-item ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            onClick={() => onMessageClick(message.id)}
          >
            <div className="search-result-sender">
              {message.sender === 'user' ? 'You' : 'Bot'}
            </div>
            <div className="search-result-content">
              <p>{highlightText(message.text, query)}</p>
            </div>
            <div className="search-result-time">
              {message.timestamp instanceof Date 
                ? message.timestamp.toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : new Date(message.timestamp).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;