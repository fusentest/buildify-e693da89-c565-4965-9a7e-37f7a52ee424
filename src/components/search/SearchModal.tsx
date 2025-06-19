
import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import SearchFilters, { SearchFiltersState } from './SearchFilters';
import SearchResults from './SearchResults';
import { Message } from '../../types/chat';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onMessageClick: (messageId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  messages, 
  onMessageClick 
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersState>({
    sender: 'all',
    dateRange: 'all',
    sortOrder: 'newest'
  });
  const [results, setResults] = useState<Message[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Search function
  useEffect(() => {
    if (!isOpen) return;

    const searchMessages = () => {
      // Filter by search query
      let filtered = messages;
      
      if (query.trim()) {
        filtered = filtered.filter(message => 
          message.text.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Filter by sender
      if (filters.sender !== 'all') {
        filtered = filtered.filter(message => message.sender === filters.sender);
      }

      // Filter by date range
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let cutoffDate: Date;

        switch (filters.dateRange) {
          case 'today':
            cutoffDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            cutoffDate = new Date(now);
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
          case 'month':
            cutoffDate = new Date(now);
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
          default:
            cutoffDate = new Date(0); // Beginning of time
        }

        filtered = filtered.filter(message => {
          const messageDate = message.timestamp instanceof Date 
            ? message.timestamp 
            : new Date(message.timestamp);
          return messageDate >= cutoffDate;
        });
      }

      // Sort results
      filtered.sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        
        return filters.sortOrder === 'newest' 
          ? dateB.getTime() - dateA.getTime() 
          : dateA.getTime() - dateB.getTime();
      });

      setResults(filtered);
    };

    searchMessages();
  }, [query, filters, messages, isOpen]);

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: SearchFiltersState) => {
    setFilters(newFilters);
  };

  // Handle message click
  const handleMessageClick = (messageId: string) => {
    onMessageClick(messageId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        <div className="search-modal-header">
          <h2>Search Messages</h2>
          <button className="close-button" onClick={onClose} aria-label="Close search">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
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
        </div>
        
        <div className="search-modal-content">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search messages..." 
          />
          
          <SearchFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
          
          <SearchResults 
            results={results} 
            query={query} 
            onMessageClick={handleMessageClick} 
          />
        </div>
      </div>
    </div>
  );
};

export default SearchModal;