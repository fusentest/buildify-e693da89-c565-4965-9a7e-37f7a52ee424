
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  subscriptionPlans, 
  getUserSubscription, 
  createSubscription,
  cancelSubscription,
  getUserPaymentMethods,
  formatCurrency
} from '../../utils/paymentUtils';
import { SubscriptionPlan, Subscription } from '../../types/payment';
import './Payment.css';

interface SubscriptionPlansProps {
  onSubscriptionChange?: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSubscriptionChange }) => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      loadSubscription();
    }
  }, [currentUser]);
  
  const loadSubscription = () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userSubscription = getUserSubscription(currentUser.id);
      setSubscription(userSubscription);
    } catch (error) {
      setError('Failed to load subscription');
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      setError('You must be logged in to subscribe');
      return;
    }
    
    setSelectedPlanId(planId);
    
    try {
      // Check if user has payment methods
      const paymentMethods = getUserPaymentMethods(currentUser.id);
      
      if (paymentMethods.length === 0) {
        setError('Please add a payment method before subscribing');
        
        // Clear error after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
        return;
      }
      
      // Get default payment method
      const defaultMethod = paymentMethods.find(method => method.isDefault);
      
      if (!defaultMethod) {
        setError('No default payment method found');
        return;
      }
      
      // Create subscription
      const newSubscription = createSubscription(
        currentUser.id,
        planId,
        defaultMethod.id
      );
      
      setSubscription(newSubscription);
      setSuccessMessage('Subscription created successfully');
      
      // Notify parent component about subscription change
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to create subscription');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setSelectedPlanId(null);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!currentUser || !subscription) return;
    
    try {
      cancelSubscription(currentUser.id, true);
      
      // Reload subscription
      loadSubscription();
      
      setSuccessMessage('Subscription will be canceled at the end of the billing period');
      setIsConfirmingCancel(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setError('Failed to cancel subscription');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const getCurrentPlan = (): SubscriptionPlan | undefined => {
    if (!subscription) return undefined;
    
    return subscriptionPlans.find(plan => plan.id === subscription.planId);
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
          <p>Please log in to view subscription plans.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="payment-content">
        <div className="loading">Loading subscription plans...</div>
      </div>
    );
  }
  
  const currentPlan = getCurrentPlan();
  
  return (
    <div className="payment-content">
      <h2>Subscription Plans</h2>
      
      {error && <div className="payment-error">{error}</div>}
      {successMessage && <div className="payment-success">{successMessage}</div>}
      
      {subscription && (
        <div className="current-subscription">
          <div className="payment-success">
            <strong>Current Plan: {currentPlan?.name}</strong>
            <p>
              Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              {subscription.cancelAtPeriodEnd && ' (Cancels at end of billing period)'}
            </p>
            <p>
              Current period ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
            
            {!subscription.cancelAtPeriodEnd && !isConfirmingCancel && (
              <button 
                className="cancel-button"
                onClick={() => setIsConfirmingCancel(true)}
              >
                Cancel Subscription
              </button>
            )}
            
            {isConfirmingCancel && (
              <div className="cancel-confirmation">
                <p>Are you sure you want to cancel your subscription?</p>
                <div className="form-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => setIsConfirmingCancel(false)}
                  >
                    No, Keep Subscription
                  </button>
                  <button 
                    className="submit-button"
                    onClick={handleCancelSubscription}
                  >
                    Yes, Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="subscription-benefits">
        <h3>Why Subscribe?</h3>
        <p>Enhance your chatbot experience with premium features and capabilities.</p>
        
        <button 
          className="benefits-toggle"
          onClick={() => setShowBenefits(!showBenefits)}
        >
          {showBenefits ? 'Hide Benefits' : 'Show Benefits'}
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
            style={{ transform: showBenefits ? 'rotate(180deg)' : 'none' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {showBenefits && (
          <div className="benefits-list">
            <div className="benefit-item">
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <div>
                <h4>Unlimited Messages</h4>
                <p>No daily limits on your conversations</p>
              </div>
            </div>
            
            <div className="benefit-item">
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
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div>
                <h4>Faster Response Times</h4>
                <p>Priority processing for all your queries</p>
              </div>
            </div>
            
            <div className="benefit-item">
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <div>
                <h4>Advanced Features</h4>
                <p>Access to premium capabilities and integrations</p>
              </div>
            </div>
            
            <div className="benefit-item">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <div>
                <h4>Priority Support</h4>
                <p>Get help faster when you need assistance</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="subscription-plans-grid">
        {subscriptionPlans.map(plan => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
          >
            {plan.isPopular && <div className="popular-badge">Popular</div>}
            
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
            
            <div className="plan-price">
              {formatCurrency(plan.price)}
              <span className="plan-interval">/{plan.interval}</span>
            </div>
            
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            {subscription && subscription.planId === plan.id ? (
              <button className="plan-button current" disabled>
                Current Plan
              </button>
            ) : (
              <button 
                className="plan-button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={selectedPlanId === plan.id}
              >
                {selectedPlanId === plan.id ? 'Processing...' : 'Subscribe'}
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="subscription-faq">
        <h3>Frequently Asked Questions</h3>
        
        <div className="faq-item">
          <h4>How will I be billed?</h4>
          <p>
            You'll be billed automatically on a recurring basis (monthly or yearly, depending on your plan).
            You can cancel anytime from your account settings.
          </p>
        </div>
        
        <div className="faq-item">
          <h4>Can I change plans?</h4>
          <p>
            Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated
            difference for the remainder of your billing cycle. When downgrading, the change will take effect at the
            end of your current billing cycle.
          </p>
        </div>
        
        <div className="faq-item">
          <h4>What happens when I cancel?</h4>
          <p>
            When you cancel your subscription, you'll continue to have access to your premium features until the
            end of your current billing period. After that, your account will revert to the free tier.
          </p>
        </div>
        
        <div className="faq-item">
          <h4>Is there a free trial?</h4>
          <p>
            We offer a 7-day free trial for new subscribers. You can cancel anytime during the trial period
            and you won't be charged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;