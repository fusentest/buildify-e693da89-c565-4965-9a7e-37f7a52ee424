
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

const SubscriptionPlans: React.FC = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  
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
    </div>
  );
};

export default SubscriptionPlans;
