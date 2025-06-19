
import { 
  PaymentMethod, 
  SubscriptionPlan, 
  Subscription, 
  Invoice, 
  CheckoutSession,
  CheckoutItem,
  PaymentIntent
} from '../types/payment';

// Mock subscription plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals',
    price: 9.99,
    interval: 'monthly',
    features: [
      'Basic chatbot features',
      'Up to 100 messages per day',
      'Email support',
      'Message history for 7 days'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Great for power users',
    price: 19.99,
    interval: 'monthly',
    features: [
      'Advanced chatbot features',
      'Unlimited messages',
      'Priority support',
      'Analytics dashboard',
      'Message history for 30 days',
      'Custom chat themes'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 49.99,
    interval: 'monthly',
    features: [
      'All Professional features',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Advanced security',
      'Unlimited message history',
      'Multi-user access'
    ]
  }
];

// Get user's payment methods
export const getUserPaymentMethods = (userId: string): PaymentMethod[] => {
  try {
    const storedMethods = localStorage.getItem(`payment_methods_${userId}`);
    return storedMethods ? JSON.parse(storedMethods) : [];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
};

// Add a payment method
export const addPaymentMethod = (userId: string, paymentMethod: Omit<PaymentMethod, 'id'>): PaymentMethod => {
  try {
    const methods = getUserPaymentMethods(userId);
    
    // If this is the first payment method, make it default
    const isDefault = methods.length === 0 ? true : paymentMethod.isDefault;
    
    // If this method is being set as default, update other methods
    if (isDefault) {
      methods.forEach(method => {
        method.isDefault = false;
      });
    }
    
    const newMethod: PaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString()
    };
    
    localStorage.setItem(`payment_methods_${userId}`, JSON.stringify([...methods, newMethod]));
    return newMethod;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw new Error('Failed to add payment method');
  }
};

// Remove a payment method
export const removePaymentMethod = (userId: string, paymentMethodId: string): boolean => {
  try {
    const methods = getUserPaymentMethods(userId);
    const methodToRemove = methods.find(m => m.id === paymentMethodId);
    
    if (!methodToRemove) {
      return false;
    }
    
    // Don't allow removing the default payment method if it's the only one
    if (methodToRemove.isDefault && methods.length === 1) {
      throw new Error('Cannot remove the only default payment method');
    }
    
    const updatedMethods = methods.filter(m => m.id !== paymentMethodId);
    
    // If we removed the default method, make another one default
    if (methodToRemove.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }
    
    localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updatedMethods));
    return true;
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw error;
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = (userId: string, paymentMethodId: string): boolean => {
  try {
    const methods = getUserPaymentMethods(userId);
    const methodExists = methods.some(m => m.id === paymentMethodId);
    
    if (!methodExists) {
      return false;
    }
    
    const updatedMethods = methods.map(method => ({
      ...method,
      isDefault: method.id === paymentMethodId
    }));
    
    localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updatedMethods));
    return true;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

// Get user's active subscription
export const getUserSubscription = (userId: string): Subscription | null => {
  try {
    const storedSubscription = localStorage.getItem(`subscription_${userId}`);
    return storedSubscription ? JSON.parse(storedSubscription) : null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

// Create a subscription
export const createSubscription = (
  userId: string, 
  planId: string, 
  paymentMethodId: string
): Subscription => {
  try {
    // Check if user already has an active subscription
    const existingSubscription = getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('User already has an active subscription');
    }
    
    // Check if payment method exists
    const paymentMethods = getUserPaymentMethods(userId);
    const paymentMethodExists = paymentMethods.some(m => m.id === paymentMethodId);
    if (!paymentMethodExists) {
      throw new Error('Invalid payment method');
    }
    
    // Check if plan exists
    const planExists = subscriptionPlans.some(p => p.id === planId);
    if (!planExists) {
      throw new Error('Invalid subscription plan');
    }
    
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription period
    
    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      paymentMethodId
    };
    
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    
    // Create an invoice for this subscription
    createInvoice(userId, subscription.id);
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = (userId: string, atPeriodEnd: boolean = true): boolean => {
  try {
    const subscription = getUserSubscription(userId);
    
    if (!subscription) {
      return false;
    }
    
    if (atPeriodEnd) {
      // Cancel at period end
      subscription.cancelAtPeriodEnd = true;
    } else {
      // Cancel immediately
      subscription.status = 'canceled';
    }
    
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Get user's invoices
export const getUserInvoices = (userId: string): Invoice[] => {
  try {
    const storedInvoices = localStorage.getItem(`invoices_${userId}`);
    return storedInvoices ? JSON.parse(storedInvoices) : [];
  } catch (error) {
    console.error('Error getting invoices:', error);
    return [];
  }
};

// Create an invoice
const createInvoice = (userId: string, subscriptionId: string): Invoice => {
  try {
    const subscription = getUserSubscription(userId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      userId,
      subscriptionId,
      amount: plan.price,
      status: 'paid',
      date: now.toISOString(),
      dueDate: dueDate.toISOString(),
      items: [
        {
          id: `item_${Date.now()}`,
          description: `${plan.name} Plan - ${plan.interval}`,
          amount: plan.price,
          quantity: 1
        }
      ]
    };
    
    const invoices = getUserInvoices(userId);
    localStorage.setItem(`invoices_${userId}`, JSON.stringify([...invoices, invoice]));
    
    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Create a checkout session
export const createCheckoutSession = (userId: string, items: CheckoutItem[]): CheckoutSession => {
  try {
    if (!items.length) {
      throw new Error('Checkout requires at least one item');
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax rate
    const total = subtotal + tax;
    
    const session: CheckoutSession = {
      id: `cs_${Date.now()}`,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`checkout_session_${userId}`, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Complete a checkout session
export const completeCheckoutSession = (userId: string, paymentMethodId: string): CheckoutSession => {
  try {
    const sessionData = localStorage.getItem(`checkout_session_${userId}`);
    if (!sessionData) {
      throw new Error('No active checkout session');
    }
    
    const session: CheckoutSession = JSON.parse(sessionData);
    
    // Check if payment method exists
    const paymentMethods = getUserPaymentMethods(userId);
    const paymentMethodExists = paymentMethods.some(m => m.id === paymentMethodId);
    if (!paymentMethodExists) {
      throw new Error('Invalid payment method');
    }
    
    session.paymentMethodId = paymentMethodId;
    session.status = 'completed';
    
    localStorage.setItem(`checkout_session_${userId}`, JSON.stringify(session));
    
    // Store the order in order history
    const orders = JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]');
    orders.push({
      id: `order_${Date.now()}`,
      checkoutSessionId: session.id,
      items: session.items,
      total: session.total,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));
    
    // Create an invoice for this purchase
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      userId,
      subscriptionId: 'one_time_purchase',
      amount: session.total,
      status: 'paid',
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      items: session.items.map(item => ({
        id: `item_${Date.now()}_${item.id}`,
        description: item.name,
        amount: item.price,
        quantity: item.quantity
      }))
    };
    
    const invoices = getUserInvoices(userId);
    localStorage.setItem(`invoices_${userId}`, JSON.stringify([...invoices, invoice]));
    
    return session;
  } catch (error) {
    console.error('Error completing checkout session:', error);
    throw error;
  }
};

// Create a payment intent (for direct payments)
export const createPaymentIntent = (amount: number, currency: string = 'usd'): PaymentIntent => {
  try {
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`
    };
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm a payment intent
export const confirmPaymentIntent = (
  paymentIntentId: string, 
  paymentMethodId: string
): PaymentIntent => {
  try {
    // In a real implementation, this would call the payment gateway API
    // Here we just simulate a successful payment
    
    const paymentIntent: PaymentIntent = {
      id: paymentIntentId,
      amount: 0, // In a real implementation, this would be retrieved from the stored payment intent
      currency: 'usd',
      status: 'succeeded'
    };
    
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Mask credit card number
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) {
    return '****';
  }
  
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
};

// Get card type from number
export const getCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | 'other' => {
  // Remove spaces and dashes
  const number = cardNumber.replace(/[\s-]/g, '');
  
  // Visa: Starts with 4
  if (/^4/.test(number)) return 'visa';
  
  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01])/.test(number)) return 'mastercard';
  
  // American Express: Starts with 34 or 37
  if (/^3[47]/.test(number)) return 'amex';
  
  // Discover: Starts with 6011, 622126-622925, 644-649, or 65
  if (/^(6011|65|64[4-9]|622(12[6-9]|1[3-9]|[2-8]|9[01]|92[0-5]))/.test(number)) return 'discover';
  
  return 'other';
};

// Apply subscription benefits to user
export const applySubscriptionBenefits = (userId: string): void => {
  try {
    const subscription = getUserSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return;
    }
    
    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    if (!plan) {
      return;
    }
    
    // Store user benefits based on subscription plan
    const benefits = {
      maxMessagesPerDay: plan.id === 'basic' ? 100 : 
                         plan.id === 'pro' ? 500 : 
                         Infinity,
      messageHistoryDays: plan.id === 'basic' ? 7 : 
                          plan.id === 'pro' ? 30 : 
                          365,
      prioritySupport: plan.id !== 'basic',
      customThemes: plan.id !== 'basic',
      analytics: plan.id !== 'basic',
      multiUser: plan.id === 'enterprise'
    };
    
    localStorage.setItem(`subscription_benefits_${userId}`, JSON.stringify(benefits));
  } catch (error) {
    console.error('Error applying subscription benefits:', error);
  }
};

// Check if user has a specific subscription benefit
export const hasSubscriptionBenefit = (userId: string, benefit: string): boolean => {
  try {
    const benefitsData = localStorage.getItem(`subscription_benefits_${userId}`);
    if (!benefitsData) {
      return false;
    }
    
    const benefits = JSON.parse(benefitsData);
    return !!benefits[benefit];
  } catch (error) {
    console.error('Error checking subscription benefit:', error);
    return false;
  }
};

// Get user's remaining message quota
export const getRemainingMessageQuota = (userId: string): number => {
  try {
    const benefitsData = localStorage.getItem(`subscription_benefits_${userId}`);
    if (!benefitsData) {
      return 10; // Default free tier limit
    }
    
    const benefits = JSON.parse(benefitsData);
    const maxMessages = benefits.maxMessagesPerDay || 10;
    
    // Get messages sent today
    const today = new Date().toDateString();
    const messageCountData = localStorage.getItem(`message_count_${userId}_${today}`);
    const messageCount = messageCountData ? parseInt(messageCountData, 10) : 0;
    
    return Math.max(0, maxMessages - messageCount);
  } catch (error) {
    console.error('Error getting remaining message quota:', error);
    return 0;
  }
};

// Increment user's message count for today
export const incrementMessageCount = (userId: string): void => {
  try {
    const today = new Date().toDateString();
    const messageCountKey = `message_count_${userId}_${today}`;
    const messageCountData = localStorage.getItem(messageCountKey);
    const messageCount = messageCountData ? parseInt(messageCountData, 10) : 0;
    
    localStorage.setItem(messageCountKey, (messageCount + 1).toString());
  } catch (error) {
    console.error('Error incrementing message count:', error);
  }
};