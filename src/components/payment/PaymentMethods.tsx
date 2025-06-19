
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getUserPaymentMethods, 
  removePaymentMethod, 
  setDefaultPaymentMethod,
  maskCardNumber
} from '../../utils/paymentUtils';
import { PaymentMethod } from '../../types/payment';
import PaymentMethodForm from './PaymentMethodForm';
import './Payment.css';

const PaymentMethods: React.FC = () => {
  const { currentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      loadPaymentMethods();
    }
  }, [currentUser]);
  
  const loadPaymentMethods = () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const methods = getUserPaymentMethods(currentUser.id);
      setPaymentMethods(methods);
    } catch (error) {
      setError('Failed to load payment methods');
      console.error('Error loading payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMethodSuccess = () => {
    setIsAddingMethod(false);
    loadPaymentMethods();
    setSuccessMessage('Payment method added successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  const handleRemoveMethod = (paymentMethodId: string) => {
    if (!currentUser) return;
    
    try {
      removePaymentMethod(currentUser.id, paymentMethodId);
      loadPaymentMethods();
      setSuccessMessage('Payment method removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to remove payment method');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const handleSetDefaultMethod = (paymentMethodId: string) => {
    if (!currentUser) return;
    
    try {
      setDefaultPaymentMethod(currentUser.id, paymentMethodId);
      loadPaymentMethods();
      setSuccessMessage('Default payment method updated');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setError('Failed to update default payment method');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const renderPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'credit_card') {
      const { cardType } = method.details as any;
      
      // Return appropriate card icon based on card type
      return (
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
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      );
    } else if (method.type === 'paypal') {
      return (
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
          <path d="M7 11l5-5 5 5"></path>
          <path d="M12 6v12"></path>
        </svg>
      );
    } else if (method.type === 'bank_transfer') {
      return (
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
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      );
    }
    
    return null;
  };
  
  const renderPaymentMethodDetails = (method: PaymentMethod) => {
    if (method.type === 'credit_card') {
      const { cardNumber, cardType, expiryMonth, expiryYear, cardholderName } = method.details as any;
      
      return (
        <>
          <h3>
            {cardType.charAt(0).toUpperCase() + cardType.slice(1)} Card
            {method.isDefault && <span className="payment-method-badge">Default</span>}
          </h3>
          <p>
            {maskCardNumber(cardNumber)} • Expires {expiryMonth}/{expiryYear}
          </p>
        </>
      );
    } else if (method.type === 'paypal') {
      const { email } = method.details as any;
      
      return (
        <>
          <h3>
            PayPal
            {method.isDefault && <span className="payment-method-badge">Default</span>}
          </h3>
          <p>{email}</p>
        </>
      );
    } else if (method.type === 'bank_transfer') {
      const { accountNumber, bankName } = method.details as any;
      
      return (
        <>
          <h3>
            Bank Account
            {method.isDefault && <span className="payment-method-badge">Default</span>}
          </h3>
          <p>{bankName} • Account ending in {accountNumber}</p>
        </>
      );
    }
    
    return null;
  };
  
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
          <p>Please log in to manage your payment methods.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="payment-content">
        <div className="loading">Loading payment methods...</div>
      </div>
    );
  }
  
  return (
    <div className="payment-content">
      <h2>Payment Methods</h2>
      
      {error && <div className="payment-error">{error}</div>}
      {successMessage && <div className="payment-success">{successMessage}</div>}
      
      {isAddingMethod ? (
        <PaymentMethodForm 
          onSuccess={handleAddMethodSuccess} 
          onCancel={() => setIsAddingMethod(false)} 
        />
      ) : (
        <>
          <div className="payment-methods-list">
            {paymentMethods.length > 0 ? (
              paymentMethods.map(method => (
                <div key={method.id} className="payment-method-item">
                  <div className="payment-method-info">
                    <div className="payment-method-icon">
                      {renderPaymentMethodIcon(method)}
                    </div>
                    <div className="payment-method-details">
                      {renderPaymentMethodDetails(method)}
                    </div>
                  </div>
                  <div className="payment-method-actions">
                    {!method.isDefault && (
                      <button 
                        onClick={() => handleSetDefaultMethod(method.id)}
                        title="Set as default"
                      >
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
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveMethod(method.id)}
                      className="delete-button"
                      title="Remove"
                    >
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
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
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
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <h3>No Payment Methods</h3>
                <p>You haven't added any payment methods yet.</p>
              </div>
            )}
            
            <button 
              className="add-payment-method-button"
              onClick={() => setIsAddingMethod(true)}
            >
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Payment Method
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentMethods;
