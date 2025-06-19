
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getUserPaymentMethods, 
  createCheckoutSession,
  completeCheckoutSession,
  formatCurrency
} from '../../utils/paymentUtils';
import { CheckoutItem, CheckoutSession, PaymentMethod } from '../../types/payment';
import './Payment.css';

// Sample checkout items
const sampleItems: CheckoutItem[] = [
  {
    id: 'item_1',
    name: 'Premium Chat Credits',
    description: '100 premium chat credits',
    price: 9.99,
    quantity: 1
  },
  {
    id: 'item_2',
    name: 'Advanced Analytics',
    description: 'Access to advanced analytics for 30 days',
    price: 4.99,
    quantity: 1
  }
];

type CheckoutStep = 'cart' | 'payment' | 'confirmation';

const Checkout: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<CheckoutItem[]>(sampleItems);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      // Load payment methods
      const methods = getUserPaymentMethods(currentUser.id);
      setPaymentMethods(methods);
      
      // Set default payment method if available
      const defaultMethod = methods.find(method => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethodId(defaultMethod.id);
      }
      
      // Create checkout session
      try {
        const newSession = createCheckoutSession(currentUser.id, items);
        setSession(newSession);
      } catch (error) {
        console.error('Error creating checkout session:', error);
      }
    }
  }, [currentUser]);
  
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setItems(updatedItems);
    
    // Update checkout session
    if (currentUser) {
      try {
        const newSession = createCheckoutSession(currentUser.id, updatedItems);
        setSession(newSession);
      } catch (error) {
        console.error('Error updating checkout session:', error);
      }
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    
    setItems(updatedItems);
    
    // Update checkout session
    if (currentUser && updatedItems.length > 0) {
      try {
        const newSession = createCheckoutSession(currentUser.id, updatedItems);
        setSession(newSession);
      } catch (error) {
        console.error('Error updating checkout session:', error);
      }
    }
  };
  
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethodId(e.target.value);
  };
  
  const handleNextStep = () => {
    if (currentStep === 'cart') {
      if (items.length === 0) {
        setError('Your cart is empty');
        return;
      }
      
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!selectedPaymentMethodId) {
        setError('Please select a payment method');
        return;
      }
      
      handleCompleteCheckout();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('cart');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
  };
  
  const handleCompleteCheckout = async () => {
    if (!currentUser || !session || !selectedPaymentMethodId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const completedSession = completeCheckoutSession(
        currentUser.id,
        selectedPaymentMethodId
      );
      
      setSession(completedSession);
      setCurrentStep('confirmation');
      setSuccessMessage('Payment successful! Your order has been processed.');
    } catch (error: any) {
      setError(error.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderCartStep = () => {
    if (items.length === 0) {
      return (
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
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3>Your Cart is Empty</h3>
          <p>Add items to your cart to continue.</p>
        </div>
      );
    }
    
    return (
      <div className="checkout-items">
        {items.map(item => (
          <div key={item.id} className="checkout-item">
            {item.image && (
              <img src={item.image} alt={item.name} className="item-image" />
            )}
            
            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              
              <div className="item-quantity">
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </button>
                
                <button 
                  className="remove-item"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div className="item-price">
              {formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        ))}
        
        {session && (
          <div className="checkout-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(session.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>{formatCurrency(session.tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(session.total)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderPaymentStep = () => {
    if (paymentMethods.length === 0) {
      return (
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
          <p>Please add a payment method to continue.</p>
        </div>
      );
    }
    
    return (
      <div className="payment-methods-selection">
        <h3>Select Payment Method</h3>
        
        <div className="payment-methods-list">
          {paymentMethods.map(method => {
            let methodName = '';
            let methodDetails = '';
            
            if (method.type === 'credit_card') {
              const details = method.details as any;
              methodName = `${details.cardType.charAt(0).toUpperCase() + details.cardType.slice(1)} Card`;
              methodDetails = `**** **** **** ${details.cardNumber}`;
            } else if (method.type === 'paypal') {
              const details = method.details as any;
              methodName = 'PayPal';
              methodDetails = details.email;
            } else if (method.type === 'bank_transfer') {
              const details = method.details as any;
              methodName = 'Bank Account';
              methodDetails = `${details.bankName} **** ${details.accountNumber}`;
            }
            
            return (
              <div key={method.id} className="payment-method-option">
                <input
                  type="radio"
                  id={`method-${method.id}`}
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethodId === method.id}
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor={`method-${method.id}`}>
                  <div className="method-name">{methodName}</div>
                  <div className="method-details">{methodDetails}</div>
                  {method.isDefault && <span className="default-badge">Default</span>}
                </label>
              </div>
            );
          })}
        </div>
        
        {session && (
          <div className="checkout-summary">
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(session.total)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderConfirmationStep = () => {
    return (
      <div className="checkout-confirmation">
        <div className="success-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h2>Thank You for Your Purchase!</h2>
        <p>Your order has been successfully processed.</p>
        
        <div className="order-details">
          <h3>Order Summary</h3>
          
          {items.map(item => (
            <div key={item.id} className="order-item">
              <div className="item-name">
                {item.name} x {item.quantity}
              </div>
              <div className="item-price">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
          
          {session && (
            <div className="order-total">
              <span>Total</span>
              <span>{formatCurrency(session.total)}</span>
            </div>
          )}
        </div>
        
        <p className="confirmation-message">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    );
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
          <p>Please log in to proceed with checkout.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-content">
      <h2>Checkout</h2>
      
      {error && <div className="payment-error">{error}</div>}
      {successMessage && <div className="payment-success">{successMessage}</div>}
      
      <div className="checkout-container">
        <div className="checkout-steps">
          <div className={`checkout-step ${currentStep === 'cart' ? 'active' : ''} ${currentStep === 'payment' || currentStep === 'confirmation' ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Cart</div>
          </div>
          
          <div className={`checkout-step ${currentStep === 'payment' ? 'active' : ''} ${currentStep === 'confirmation' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Payment</div>
          </div>
          
          <div className={`checkout-step ${currentStep === 'confirmation' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>
        
        <div className="checkout-content">
          {currentStep === 'cart' && renderCartStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}
        </div>
        
        {currentStep !== 'confirmation' && (
          <div className="checkout-actions">
            {currentStep !== 'cart' && (
              <button 
                className="back-button"
                onClick={handlePreviousStep}
                disabled={isLoading}
              >
                Back
              </button>
            )}
            
            <button 
              className="next-button"
              onClick={handleNextStep}
              disabled={isLoading || items.length === 0}
            >
              {isLoading ? 'Processing...' : currentStep === 'cart' ? 'Proceed to Payment' : 'Complete Purchase'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
