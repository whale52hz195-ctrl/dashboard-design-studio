import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Real API Service - All data from Firebase
export class RealApiService {
  
  // User Management
  static async getUser(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async getAllUsers(limitCount = 50) {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, data: any) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Live Streaming
  static async getLiveStreams() {
    try {
      const streamsQuery = query(
        collection(db, 'liveStreams'),
        where('status', '==', 'live'),
        orderBy('viewerCount', 'desc')
      );
      const snapshot = await getDocs(streamsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting live streams:', error);
      throw error;
    }
  }

  static async getLiveStream(streamId: string) {
    try {
      const streamDoc = await getDoc(doc(db, 'liveStreams', streamId));
      return streamDoc.exists() ? { id: streamDoc.id, ...streamDoc.data() } : null;
    } catch (error) {
      console.error('Error getting live stream:', error);
      throw error;
    }
  }

  static async createLiveStream(streamData: any) {
    try {
      const agoraConfig = await getDoc(doc(db, 'agoraConfig', 'production'));
      const config = agoraConfig.data();
      
      if (!config?.enabled || !config.appId) {
        throw new Error('Agora not configured');
      }

      const channelName = `channel_${Date.now()}`;
      const agoraToken = `token_${Date.now()}_${streamData.hostId}`;

      const newStream = {
        ...streamData,
        channelName,
        agoraToken,
        viewerCount: 0,
        status: 'live',
        startTime: serverTimestamp(),
        coinsEarned: 0,
        giftsReceived: 0,
        duration: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const streamRef = await addDoc(collection(db, 'liveStreams'), newStream);
      return { 
        success: true, 
        streamId: streamRef.id, 
        channelName, 
        agoraToken,
        appId: config.appId
      };
    } catch (error) {
      console.error('Error creating live stream:', error);
      throw error;
    }
  }

  static async updateLiveStream(streamId: string, data: any) {
    try {
      await updateDoc(doc(db, 'liveStreams', streamId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating live stream:', error);
      throw error;
    }
  }

  static async endLiveStream(streamId: string) {
    try {
      await updateDoc(doc(db, 'liveStreams', streamId), {
        status: 'ended',
        endTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error ending live stream:', error);
      throw error;
    }
  }

  static subscribeToLiveStreams(callback: (streams: any[]) => void) {
    const streamsQuery = query(
      collection(db, 'liveStreams'),
      where('status', '==', 'live'),
      orderBy('viewerCount', 'desc')
    );

    return onSnapshot(streamsQuery, (snapshot) => {
      const streams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(streams);
    });
  }

  // Transactions
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

  static async createTransaction(transactionData: any) {
    try {
      const newTransaction = {
        ...transactionData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const transactionRef = await addDoc(collection(db, 'transactions'), newTransaction);
      return { success: true, transactionId: transactionRef.id };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async updateTransactionStatus(transactionId: string, status: string, metadata?: any) {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      await updateDoc(doc(db, 'transactions', transactionId), updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // Payment Gateways
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

  static async updatePaymentGateway(gatewayId: string, data: any) {
    try {
      await updateDoc(doc(db, 'paymentGateways', gatewayId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      throw error;
    }
  }

  // Notifications
  static async getNotifications(limitCount = 50) {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  static async sendNotification(notificationData: any) {
    try {
      const newNotification = {
        ...notificationData,
        status: 'sent',
        sentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sentAt: serverTimestamp()
      };

      const notificationRef = await addDoc(collection(db, 'notifications'), newNotification);
      return { success: true, notificationId: notificationRef.id };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Analytics
  static async getDashboardStats() {
    try {
      const statsDoc = await getDoc(doc(db, 'realtime', 'dashboardStats'));
      return statsDoc.exists() ? statsDoc.data() : null;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  static async getUserStats() {
    try {
      const statsDoc = await getDoc(doc(db, 'realtime', 'userStats'));
      return statsDoc.exists() ? statsDoc.data() : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  static async trackEvent(eventData: any) {
    try {
      const newEvent = {
        ...eventData,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'analyticsEvents'), newEvent);
      return { success: true };
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  static async getAnalyticsEvents(limitCount = 100) {
    try {
      const eventsQuery = query(
        collection(db, 'analyticsEvents'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(eventsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting analytics events:', error);
      throw error;
    }
  }

  // Agora Configuration
  static async getAgoraConfig() {
    try {
      const configDoc = await getDoc(doc(db, 'agoraConfig', 'production'));
      return configDoc.exists() ? configDoc.data() : null;
    } catch (error) {
      console.error('Error getting Agora config:', error);
      throw error;
    }
  }

  static async updateAgoraConfig(configData: any) {
    try {
      await updateDoc(doc(db, 'agoraConfig', 'production'), {
        ...configData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating Agora config:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  static subscribeToDashboardStats(callback: (stats: any) => void) {
    return onSnapshot(doc(db, 'realtime', 'dashboardStats'), (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static subscribeToUserStats(callback: (stats: any) => void) {
    return onSnapshot(doc(db, 'realtime', 'userStats'), (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static subscribeToTransactions(callback: (transactions: any[]) => void) {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(transactionsQuery, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(transactions);
    });
  }

  // Authentication (simplified for demo)
  static async login(email: string, password: string) {
    try {
      // In real implementation, use Firebase Auth
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        throw new Error('User not found');
      }

      const user = snapshot.docs[0].data();
      return { success: true, user: { id: snapshot.docs[0].id, ...user } };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  static async register(userData: any) {
    try {
      const newUser = {
        ...userData,
        role: 'user',
        vip: false,
        verified: false,
        coins: 1000,
        level: 1,
        followers: 0,
        following: 0,
        status: 'online',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const userRef = await addDoc(collection(db, 'users'), newUser);
      return { success: true, userId: userRef.id };
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }
}

export default RealApiService;
