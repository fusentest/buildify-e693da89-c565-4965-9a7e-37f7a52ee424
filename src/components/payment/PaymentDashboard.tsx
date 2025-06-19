
import React, { useState } from 'react';
import PaymentMethods from './PaymentMethods';
import SubscriptionPlans from './SubscriptionPlans';
import Checkout from './Checkout';
import './Payment.css';

type PaymentTab = 'methods' | 'subscriptions' | 'checkout';

const PaymentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('methods');
  
  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Payment Dashboard</h1>
        <p>Manage your payment methods, subscriptions, and checkout</p>
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
      </div>
      
      {activeTab === 'methods' && <PaymentMethods />}
      {activeTab === 'subscriptions' && <SubscriptionPlans />}
      {activeTab === 'checkout' && <Checkout />}
    </div>
  );
};

export default PaymentDashboard;
