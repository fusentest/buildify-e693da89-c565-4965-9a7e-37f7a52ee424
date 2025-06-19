
import React, { useState, useEffect } from 'react';
import { Message } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import './ContentModeration.css';

interface FlaggedMessage extends Message {
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const ContentModeration: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to get flagged messages
      // Here we're simulating by getting all messages from localStorage
      const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      
      // Convert to FlaggedMessage type and add mock flagging data
      const flaggedMessages: FlaggedMessage[] = storedMessages.map((msg: any, index: number) => {
        // Simulate some messages being flagged
        const isFlagged = index % 3 === 0;
        
        if (isFlagged) {
          return {
            ...msg,
            timestamp: new Date(msg.timestamp),
            flagReason: 'Potentially inappropriate content',
            flaggedBy: 'system',
            flaggedAt: new Date(new Date(msg.timestamp).getTime() + 1000 * 60 * 5), // 5 minutes after message
            status: index % 9 === 0 ? 'approved' : index % 6 === 0 ? 'rejected' : 'pending'
          };
        }
        
        return {
          ...msg,
          timestamp: new Date(msg.timestamp),
          status: 'approved' // Non-flagged messages are considered approved
        };
      });
      
      setMessages(flaggedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'approved' } 
          : msg
      )
    );
    
    showSuccessMessage('Message approved successfully');
  };
  
  const handleRejectMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'rejected' } 
          : msg
      )
    );
    
    showSuccessMessage('Message rejected successfully');
  };
  
  const handleDeleteMessage = (messageId: string) => {
    // Remove from UI
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Remove from localStorage
    try {
      const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      const updatedMessages = storedMessages.filter((msg: any) => msg.id !== messageId);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      
      showSuccessMessage('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const filteredMessages = messages
    .filter(msg => {
      if (filter === 'all') return true;
      return msg.status === filter;
    })
    .filter(msg => {
      if (!searchTerm) return true;
      return msg.text.toLowerCase().includes(searchTerm.toLowerCase());
    });
  
  if (isLoading) {
    return <div className="loading">Loading messages...</div>;
  }
  
  return (
    <div className="content-moderation">
      <div className="moderation-header">
        <h2>Content Moderation</h2>
        <p>Review and moderate chat messages</p>
      </div>
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <div className="moderation-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>
      
      <div className="messages-list">
        {filteredMessages.length > 0 ? (
          filteredMessages.map(message => (
            <div 
              key={message.id} 
              className={`message-card ${message.status}`}
            >
              <div className="message-header">
                <div className="message-sender">
                  {message.sender === 'user' ? 'User' : 'Bot'}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleString()}
                </div>
              </div>
              
              <div className="message-content">
                {message.text}
              </div>
              
              {message.flagReason && (
                <div className="flag-info">
                  <div className="flag-reason">
                    <strong>Flag Reason:</strong> {message.flagReason}
                  </div>
                  <div className="flag-details">
                    <span>Flagged by: {message.flaggedBy}</span>
                    <span>Flagged at: {message.flaggedAt?.toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              <div className="message-actions">
                {message.status === 'pending' && (
                  <>
                    <button 
                      className="approve-button"
                      onClick={() => handleApproveMessage(message.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleRejectMessage(message.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            <p>No messages found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentModeration;