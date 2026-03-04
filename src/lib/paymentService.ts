import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'razorpay' | 'flutterwave' | 'googleplay';
  enabled: boolean;
  config: {
    publishableKey?: string;
    secretKey?: string;
    clientId?: string;
    clientSecret?: string;
    serviceEmail?: string;
    privateKey?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  gateway: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  gatewayTransactionId?: string;
  coins: number;
  bonus?: number;
  description: string;
  metadata?: any;
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  userType: 'user' | 'host' | 'agency';
  userName: string;
  userEmail: string;
  amount: number;
  coins: number;
  paymentMethod: string;
  paymentDetails: string | string[];
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
  requestId: string;
  gateway?: string;
  gatewayTransactionId?: string;
  processedAt?: any;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

// Get payment gateways configuration
export const getPaymentGateways = async (): Promise<PaymentGateway[]> => {
  try {
    const gatewaysQuery = query(collection(db, 'paymentGateways'), orderBy('name'));
    const snapshot = await getDocs(gatewaysQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentGateway));
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return [];
  }
};

// Subscribe to payment gateways updates
export const subscribeToPaymentGateways = (callback: (gateways: PaymentGateway[]) => void) => {
  const gatewaysQuery = query(collection(db, 'paymentGateways'), orderBy('name'));
  
  return onSnapshot(gatewaysQuery, (snapshot) => {
    const gateways = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentGateway));
    callback(gateways);
  });
};

// Update payment gateway configuration
export const updatePaymentGateway = async (gatewayId: string, config: Partial<PaymentGateway>) => {
  try {
    const gatewayRef = doc(db, 'paymentGateways', gatewayId);
    await updateDoc(gatewayRef, {
      ...config,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating payment gateway:', error);
    return false;
  }
};

// Create a transaction
export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return transactionRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Get all transactions
export const getTransactions = async (filters?: {
  status?: string;
  gateway?: string;
  userId?: string;
  startDate?: any;
  endDate?: any;
}): Promise<Transaction[]> => {
  try {
    let transactionsQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    
    if (filters?.status) {
      transactionsQuery = query(transactionsQuery, where('status', '==', filters.status));
    }
    
    if (filters?.gateway) {
      transactionsQuery = query(transactionsQuery, where('gateway', '==', filters.gateway));
    }
    
    if (filters?.userId) {
      transactionsQuery = query(transactionsQuery, where('userId', '==', filters.userId));
    }
    
    const snapshot = await getDocs(transactionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Subscribe to transactions updates
export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void, filters?: any) => {
  let transactionsQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
  
  if (filters?.status) {
    transactionsQuery = query(transactionsQuery, where('status', '==', filters.status));
  }
  
  return onSnapshot(transactionsQuery, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
    callback(transactions);
  });
};

// Update transaction status
export const updateTransactionStatus = async (transactionId: string, status: Transaction['status'], gatewayTransactionId?: string) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }
    
    if (gatewayTransactionId) {
      updateData.gatewayTransactionId = gatewayTransactionId;
    }
    
    await updateDoc(transactionRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
};

// Create payout request
export const createPayoutRequest = async (payoutData: Omit<PayoutRequest, 'id' | 'createdAt' | 'updatedAt' | 'requestId'>) => {
  try {
    const requestId = `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const payoutRef = await addDoc(collection(db, 'payoutRequests'), {
      ...payoutData,
      requestId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return payoutRef.id;
  } catch (error) {
    console.error('Error creating payout request:', error);
    throw error;
  }
};

// Get payout requests
export const getPayoutRequests = async (filters?: {
  status?: string;
  userType?: string;
}): Promise<PayoutRequest[]> => {
  try {
    let requestsQuery = query(collection(db, 'payoutRequests'), orderBy('createdAt', 'desc'));
    
    if (filters?.status) {
      requestsQuery = query(requestsQuery, where('status', '==', filters.status));
    }
    
    if (filters?.userType) {
      requestsQuery = query(requestsQuery, where('userType', '==', filters.userType));
    }
    
    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PayoutRequest));
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    return [];
  }
};

// Update payout request status
export const updatePayoutRequestStatus = async (requestId: string, status: PayoutRequest['status'], notes?: string, gatewayTransactionId?: string) => {
  try {
    const requestRef = doc(db, 'payoutRequests', requestId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'completed' || status === 'processing') {
      updateData.processedAt = serverTimestamp();
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    if (gatewayTransactionId) {
      updateData.gatewayTransactionId = gatewayTransactionId;
    }
    
    await updateDoc(requestRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating payout request status:', error);
    return false;
  }
};

// Get payment statistics
export const getPaymentStats = async () => {
  try {
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const transactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);
    
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    
    const revenueByGateway = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        acc[t.gateway] = (acc[t.gateway] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      totalRevenue,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      revenueByGateway,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      revenueByGateway: {},
      successRate: 0
    };
  }
};
