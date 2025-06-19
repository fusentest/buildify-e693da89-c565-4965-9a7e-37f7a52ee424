
import React, { useState, useEffect } from 'react';
import PaymentMethods from './PaymentMethods';
import SubscriptionPlans from './SubscriptionPlans';
import Checkout from './Checkout';
import PaymentHistory from './PaymentHistory';
import { useAuth } from '../../context/AuthContext';
import { getUserSubscription } from '../../utils/paymentUtils';
import './Payment.css';

type PaymentTab = 'methods' | 'subscriptions' | 'checkout' | 'history';

const PaymentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<PaymentTab>('methods');
  const [hasSubscription, setHasSubscription] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      // Check if user has an active subscription
      const subscription = getUserSubscription(currentUser.id);
      setHasSubscription(!!subscription && subscription.status === 'active');
    }
  }, [currentUser]);
  
  return (
    <div className="payment-container">
      <div className="payment-header">
        <div>
          <h1>Payment Dashboard</h1>
          <p>Manage your payment methods, subscriptions, and transactions</p>
        </div>
        
        {hasSubscription && (
          <div className="subscription-badge">
            <span>Active Subscription</span>
          </div>
        )}
      </div>
      
      <div className="payment-tabs">
        <button 
          className={`payment-tab ${activeTab === 'methods' ? 'active' : ''}`}
          onClick={() => setActiveTab('methods')}
        >
          Payment Methods
        </button>
        
        <button 
          className={`payment-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscription Plans
        </button>
        
        <button 
          className={`payment-tab ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          Checkout
        </button>
        
        <button 
          className={`payment-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </button>
      </div>
      
      {activeTab === 'methods' && <PaymentMethods />}
      {activeTab === 'subscriptions' && <SubscriptionPlans onSubscriptionChange={() => setHasSubscription(true)} />}
      {activeTab === 'checkout' && <Checkout />}
      {activeTab === 'history' && <PaymentHistory />}
    </div>
  );
};

export default PaymentDashboard;