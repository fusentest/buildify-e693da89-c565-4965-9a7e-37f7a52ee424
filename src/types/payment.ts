
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  details: CreditCardDetails | PayPalDetails | BankTransferDetails;
  isDefault: boolean;
}

export interface CreditCardDetails {
  cardNumber: string; // Last 4 digits only for display
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
}

export interface PayPalDetails {
  email: string;
}

export interface BankTransferDetails {
  accountNumber: string; // Last 4 digits only for display
  bankName: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodId: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  date: string;
  dueDate: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
}

export interface CheckoutItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CheckoutSession {
  id: string;
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethodId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
