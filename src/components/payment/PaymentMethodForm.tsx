
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addPaymentMethod, getCardType } from '../../utils/paymentUtils';
import './Payment.css';

interface PaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [paymentType, setPaymentType] = useState<'credit_card' | 'paypal' | 'bank_transfer'>('credit_card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  
  // PayPal form state
  const [paypalEmail, setPaypalEmail] = useState('');
  
  // Bank transfer form state
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankName, setBankName] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to add a payment method');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      if (paymentType === 'credit_card') {
        // Validate credit card form
        if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
          throw new Error('Please fill in all required fields');
        }
        
        // In a real implementation, you would send this data to your payment processor
        // Here we're just simulating the process
        
        // Add payment method to local storage
        addPaymentMethod(currentUser.id, {
          type: 'credit_card',
          details: {
            cardNumber: cardNumber.slice(-4), // Only store last 4 digits
            cardType: getCardType(cardNumber),
            expiryMonth,
            expiryYear,
            cardholderName
          },
          isDefault
        });
      } else if (paymentType === 'paypal') {
        // Validate PayPal form
        if (!paypalEmail) {
          throw new Error('Please enter your PayPal email');
        }
        
        // Add payment method to local storage
        addPaymentMethod(currentUser.id, {
          type: 'paypal',
          details: {
            email: paypalEmail
          },
          isDefault
        });
      } else if (paymentType === 'bank_transfer') {
        // Validate bank transfer form
        if (!accountNumber || !routingNumber || !bankName) {
          throw new Error('Please fill in all required fields');
        }
        
        // Add payment method to local storage
        addPaymentMethod(currentUser.id, {
          type: 'bank_transfer',
          details: {
            accountNumber: accountNumber.slice(-4), // Only store last 4 digits
            bankName
          },
          isDefault
        });
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);
    
    // Add spaces after every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };
  
  return (
    <div className="payment-method-form">
      <h2>Add Payment Method</h2>
      
      {error && <div className="payment-error">{error}</div>}
      
      <div className="payment-type-selector">
        <button
          type="button"
          className={`payment-type-button ${paymentType === 'credit_card' ? 'active' : ''}`}
          onClick={() => setPaymentType('credit_card')}
        >
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
          Credit Card
        </button>
        
        <button
          type="button"
          className={`payment-type-button ${paymentType === 'paypal' ? 'active' : ''}`}
          onClick={() => setPaymentType('paypal')}
        >
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
          PayPal
        </button>
        
        <button
          type="button"
          className={`payment-type-button ${paymentType === 'bank_transfer' ? 'active' : ''}`}
          onClick={() => setPaymentType('bank_transfer')}
        >
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
          Bank Transfer
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="payment-form">
        {paymentType === 'credit_card' && (
          <>
            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryMonth">Expiry Month</label>
                <select
                  id="expiryMonth"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  required
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expiryYear">Expiry Year</label>
                <select
                  id="expiryYear"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  required
                >
                  <option value="">Year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString();
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  required
                  maxLength={4}
                />
              </div>
            </div>
          </>
        )}
        
        {paymentType === 'paypal' && (
          <div className="form-group">
            <label htmlFor="paypalEmail">PayPal Email</label>
            <input
              type="email"
              id="paypalEmail"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        )}
        
        {paymentType === 'bank_transfer' && (
          <>
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="routingNumber">Routing Number</label>
              <input
                type="text"
                id="routingNumber"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <input
                type="text"
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank of America"
                required
              />
            </div>
          </>
        )}
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label htmlFor="isDefault">Set as default payment method</label>
        </div>
        
        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Add Payment Method'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;
