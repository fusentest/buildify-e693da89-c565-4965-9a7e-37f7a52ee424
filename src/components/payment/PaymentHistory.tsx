
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserInvoices, formatCurrency } from '../../utils/paymentUtils';
import { Invoice } from '../../types/payment';
import './Payment.css';

const PaymentHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'open'>('all');
  
  useEffect(() => {
    if (currentUser) {
      loadInvoices();
    }
  }, [currentUser]);
  
  const loadInvoices = () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userInvoices = getUserInvoices(currentUser.id);
      setInvoices(userInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'open':
        return 'status-open';
      case 'void':
        return 'status-void';
      case 'uncollectible':
        return 'status-uncollectible';
      default:
        return '';
    }
  };
  
  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });
  
  if (!currentUser) {
    return (
      <div className="payment-content">
        <div className="empty-state">
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Not Logged In</h3>
          <p>Please log in to view your payment history.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="payment-content">
        <div className="loading">Loading payment history...</div>
      </div>
    );
  }
  
  return (
    <div className="payment-content">
      <h2>Payment History</h2>
      
      <div className="history-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-button ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Paid
        </button>
        <button 
          className={`filter-button ${filter === 'open' ? 'active' : ''}`}
          onClick={() => setFilter('open')}
        >
          Open
        </button>
      </div>
      
      {filteredInvoices.length > 0 ? (
        <div className="invoices-table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.id.substring(4)}</td>
                  <td>{new Date(invoice.date).toLocaleDateString()}</td>
                  <td>{formatCurrency(invoice.amount)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className="view-invoice-button">
                      View Details
                    </button>
                    {invoice.status === 'open' && (
                      <button className="pay-invoice-button">
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h3>No Invoices Found</h3>
          <p>You don't have any {filter !== 'all' ? filter : ''} invoices yet.</p>
        </div>
      )}
      
      <div className="download-section">
        <h3>Download Reports</h3>
        <p>Download your payment history for your records or tax purposes.</p>
        
        <div className="download-buttons">
          <button className="download-button">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            PDF Report
          </button>
          
          <button className="download-button">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            CSV Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;