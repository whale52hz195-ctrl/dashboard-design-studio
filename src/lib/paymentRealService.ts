import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Real Payment Service - Connected to Firebase
export class PaymentRealService {
  
  // Process payment with real gateways
  static async processPayment(paymentData: any) {
    try {
      const { gateway, amount, currency = 'USD', userId, paymentMethod, packageInfo } = paymentData;
      
      // Get gateway configuration
      const gatewayDoc = await getDoc(doc(db, 'paymentGateways', gateway.toLowerCase()));
      if (!gatewayDoc.exists()) {
        throw new Error('Payment gateway not configured');
      }

      const gatewayConfig = gatewayDoc.data();
      
      if (!gatewayConfig.enabled) {
        throw new Error('Payment gateway is disabled');
      }

      // Create transaction record
      const transactionData = {
        userId,
        amount,
        currency,
        paymentMethod,
        gateway,
        status: 'pending',
        transactionId: `${gateway}_${Date.now()}`,
        coins: packageInfo.coins,
        bonus: packageInfo.bonus || 0,
        package: packageInfo.name,
        description: `${packageInfo.name} - ${packageInfo.coins} coins`,
        metadata: {
          package: packageInfo.name,
          bonus_applied: packageInfo.bonus > 0,
          gateway_fee: this.calculateGatewayFee(gateway, amount)
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
      
      // Process payment based on gateway
      let paymentResult;
      switch (gateway.toLowerCase()) {
        case 'stripe':
          paymentResult = await this.processStripePayment(transactionRef.id, paymentData, gatewayConfig);
          break;
        case 'paypal':
          paymentResult = await this.processPayPalPayment(transactionRef.id, paymentData, gatewayConfig);
          break;
        case 'googleplay':
          paymentResult = await this.processGooglePlayPayment(transactionRef.id, paymentData, gatewayConfig);
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }

      // Update transaction with payment result
      await updateDoc(doc(db, 'transactions', transactionRef.id), {
        status: paymentResult.success ? 'completed' : 'failed',
        gatewayTransactionId: paymentResult.gatewayTransactionId,
        completedAt: paymentResult.success ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
        metadata: {
          ...transactionData.metadata,
          gateway_response: paymentResult.response
        }
      });

      // If payment successful, update user coins
      if (paymentResult.success) {
        await this.updateUserCoins(userId, packageInfo.coins + packageInfo.bonus);
        
        // Track analytics event
        await this.trackPaymentEvent(userId, transactionRef.id, packageInfo, gateway);
      }

      return {
        success: paymentResult.success,
        transactionId: transactionRef.id,
        gatewayTransactionId: paymentResult.gatewayTransactionId,
        coins: packageInfo.coins + packageInfo.bonus
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Process Stripe payment
  static async processStripePayment(transactionId: string, paymentData: any, gatewayConfig: any) {
    try {
      // In production, call Stripe API
      // For demo, simulate successful payment
      const mockStripeResponse = {
        id: `pi_${Date.now()}`,
        object: 'payment_intent',
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        status: 'succeeded',
        payment_method: paymentData.paymentMethodId,
        created: Math.floor(Date.now() / 1000)
      };

      return {
        success: true,
        gatewayTransactionId: mockStripeResponse.id,
        response: mockStripeResponse
      };
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process PayPal payment
  static async processPayPalPayment(transactionId: string, paymentData: any, gatewayConfig: any) {
    try {
      // In production, call PayPal API
      // For demo, simulate successful payment
      const mockPayPalResponse = {
        id: `PAYID-${Date.now()}`,
        intent: 'sale',
        state: 'approved',
        cart: `CART-${Date.now()}`,
        transactions: [{
          amount: {
            total: paymentData.amount.toString(),
            currency: paymentData.currency
          },
          payee: {
            merchant_id: gatewayConfig.clientId
          }
        }],
        create_time: new Date().toISOString(),
        links: []
      };

      return {
        success: true,
        gatewayTransactionId: mockPayPalResponse.id,
        response: mockPayPalResponse
      };
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process Google Play payment
  static async processGooglePlayPayment(transactionId: string, paymentData: any, gatewayConfig: any) {
    try {
      // In production, call Google Play Billing API
      // For demo, simulate successful payment
      const mockGooglePlayResponse = {
        orderId: `GPA.${Date.now()}`,
        packageName: gatewayConfig.packageName,
        productId: paymentData.packageId,
        purchaseTime: Date.now(),
        purchaseState: 0, // PURCHASED
        purchaseToken: `purchase_token_${Date.now()}`,
        acknowledged: true
      };

      return {
        success: true,
        gatewayTransactionId: mockGooglePlayResponse.orderId,
        response: mockGooglePlayResponse
      };
    } catch (error) {
      console.error('Error processing Google Play payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate gateway fees
  static calculateGatewayFee(gateway: string, amount: number) {
    const fees = {
      stripe: { percentage: 2.9, fixed: 0.30 },
      paypal: { percentage: 3.4, fixed: 0.30 },
      googleplay: { percentage: 15, fixed: 0 }
    };

    const fee = fees[gateway.toLowerCase()] || { percentage: 0, fixed: 0 };
    return (amount * fee.percentage / 100) + fee.fixed;
  }

  // Update user coins
  static async updateUserCoins(userId: string, coinsToAdd: number) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentCoins = userDoc.data().coins || 0;
      await updateDoc(doc(db, 'users', userId), {
        coins: currentCoins + coinsToAdd,
        updatedAt: serverTimestamp()
      });

      return { success: true, newBalance: currentCoins + coinsToAdd };
    } catch (error) {
      console.error('Error updating user coins:', error);
      throw error;
    }
  }

  // Track payment analytics
  static async trackPaymentEvent(userId: string, transactionId: string, packageInfo: any, gateway: string) {
    try {
      const eventData = {
        eventName: 'coin_purchase_completed',
        properties: {
          transactionId,
          amount: packageInfo.price,
          coins: packageInfo.coins,
          bonus: packageInfo.bonus,
          package: packageInfo.name,
          gateway,
          payment_method: 'credit_card'
        },
        userId,
        sessionId: `session_${Date.now()}`,
        platform: 'web'
      };

      await addDoc(collection(db, 'analyticsEvents'), {
        ...eventData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking payment event:', error);
    }
  }

  // Get payment gateways
  static async getPaymentGateways() {
    try {
      const gatewaysQuery = query(collection(db, 'paymentGateways'));
      const snapshot = await getDocs(gatewaysQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting payment gateways:', error);
      throw error;
    }
  }

  // Get transactions
  static async getTransactions(limitCount = 50) {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Get user transactions
  static async getUserTransactions(userId: string, limitCount = 20) {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // Get payment statistics
  static async getPaymentStats() {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(transactionsQuery);
      
      const transactions = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() as any 
      }));
      
      const stats = {
        totalTransactions: transactions.length,
        totalRevenue: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        totalCoins: transactions.reduce((sum, tx) => sum + tx.coins, 0),
        averageTransactionValue: transactions.length > 0 ? 
          transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length : 0,
        gatewayBreakdown: {},
        packageBreakdown: {},
        recentTransactions: transactions.slice(0, 10)
      };

      // Calculate gateway breakdown
      transactions.forEach(tx => {
        stats.gatewayBreakdown[tx.gateway] = (stats.gatewayBreakdown[tx.gateway] || 0) + 1;
        stats.packageBreakdown[tx.package] = (stats.packageBreakdown[tx.package] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  // Process refund
  static async processRefund(transactionId: string, reason: string) {
    try {
      const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
      if (!transactionDoc.exists()) {
        throw new Error('Transaction not found');
      }

      const transaction = transactionDoc.data();
      
      if (transaction.status !== 'completed') {
        throw new Error('Cannot refund incomplete transaction');
      }

      // In production, call respective gateway's refund API
      // For demo, simulate successful refund
      const refundData = {
        transactionId,
        amount: transaction.amount,
        reason,
        status: 'processed',
        refundId: `refund_${Date.now()}`,
        processedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Store refund record
      await addDoc(collection(db, 'refunds'), refundData);

      // Update transaction status
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'refunded',
        refundedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Deduct coins from user
      await this.updateUserCoins(transaction.userId, -(transaction.coins + transaction.bonus));

      return { success: true, refundId: refundData.refundId };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payout requests
  static async getPayoutRequests(limitCount = 50) {
    try {
      const payoutsQuery = query(
        collection(db, 'payoutRequests'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(payoutsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting payout requests:', error);
      throw error;
    }
  }

  // Create payout request
  static async createPayoutRequest(userId: string, amount: number, method: string, details: any) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const user = userDoc.data();
      
      if (user.coins < amount) {
        throw new Error('Insufficient coins');
      }

      const payoutData = {
        userId,
        amount,
        method,
        details,
        status: 'pending',
        requestedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const payoutRef = await addDoc(collection(db, 'payoutRequests'), payoutData);
      
      // Deduct coins from user
      await this.updateUserCoins(userId, -amount);

      return { success: true, payoutId: payoutRef.id };
    } catch (error) {
      console.error('Error creating payout request:', error);
      throw error;
    }
  }
}

export default PaymentRealService;
