import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import serviceAccountKey from '../../serviceAccountKey.json';

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(serviceAccountKey as any)
});

export const adminDb = getFirestore(app);
export { FieldValue };

// Create initial collections and data
export const initializeFirebaseCollections = async () => {
  try {
    console.log('Initializing Firebase collections...');

    // 1. Real-time dashboard stats
    const dashboardStatsRef = adminDb.collection('realtime').doc('dashboardStats');
    await dashboardStatsRef.set({
      totalUsers: 24580,
      vipUsers: 1890,
      totalHosts: 456,
      totalAgencies: 32,
      totalCoins: 15890000,
      activeUsers: 18420,
      newUsersToday: 145,
      revenue: 89500,
      lastUpdated: FieldValue.serverTimestamp()
    });

    // 2. User stats
    const userStatsRef = adminDb.collection('realtime').doc('userStats');
    await userStatsRef.set({
      total: 24580,
      males: 12500,
      females: 12080,
      vips: 1890,
      verified: 8900,
      banned: 120,
      online: 3420,
      lastUpdated: FieldValue.serverTimestamp()
    });

    // 3. Agora configuration
    const agoraConfigRef = adminDb.collection('agoraConfig').doc('main');
    await agoraConfigRef.set({
      appId: process.env.VITE_AGORA_APP_ID || '',
      appCertificate: process.env.VITE_AGORA_APP_CERTIFICATE || '',
      enabled: true,
      maxChannels: 100,
      maxUsersPerChannel: 1000,
      createdAt: FieldValue.serverTimestamp()
    });

    // 4. Payment gateways configuration
    const paymentGateways = [
      {
        name: 'Stripe',
        type: 'stripe',
        enabled: false,
        config: {
          publishableKey: '',
          secretKey: ''
        }
      },
      {
        name: 'Razorpay',
        type: 'razorpay',
        enabled: false,
        config: {
          clientId: '',
          clientSecret: ''
        }
      },
      {
        name: 'Flutterwave',
        type: 'flutterwave',
        enabled: false,
        config: {
          clientId: ''
        }
      },
      {
        name: 'Google Play',
        type: 'googleplay',
        enabled: false,
        config: {
          serviceEmail: '',
          privateKey: ''
        }
      }
    ];

    // Use simple document creation for payment gateways
    for (const gateway of paymentGateways) {
      const docRef = adminDb.collection('paymentGateways').doc(gateway.name.toLowerCase().replace(/\s+/g, '_'));
      await docRef.set({
        ...gateway,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    // 5. FCM configuration
    const fcmConfigRef = adminDb.collection('fcmConfig').doc('config');
    await fcmConfigRef.set({
      enabled: false,
      serverKey: '',
      apiKey: '',
      authDomain: 'alkasser-d7701.firebaseapp.com',
      projectId: 'alkasser-d7701',
      storageBucket: 'alkasser-d7701.firebasestorage.app',
      messagingSenderId: '107246385920819292580',
      appId: '1:107246385920819292580:web:abcdef123456',
      measurementId: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 6. Moderation configuration
    const moderationConfigRef = adminDb.collection('moderationConfig').doc('main');
    await moderationConfigRef.set({
      sightengineUser: '',
      sightengineApiSecret: '',
      autoModerateImages: true,
      autoModerateText: true,
      autoModerateVideo: false,
      imageThreshold: 0.7,
      textThreshold: 0.8,
      videoThreshold: 0.7,
      bannedKeywords: ['spam', 'abuse', 'inappropriate', 'hate', 'violence'],
      bannedImageCategories: ['nudity', 'violence', 'weapons'],
      actionOnViolation: 'warn',
      enabled: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 7. Sample live streams
    const sampleStreams = [
      {
        hostId: 'host_001',
        hostName: 'Sarah Johnson',
        hostImage: 'https://picsum.photos/seed/100?img=5',
        title: 'Evening Music Session',
        category: 'music',
        channelName: 'channel_music_001',
        agoraToken: 'mock_token_001',
        viewerCount: 1250,
        status: 'live',
        startTime: new Date(),
        coinsEarned: 5000,
        giftsReceived: 45,
        settings: {
          allowGuests: true,
          maxViewers: 5000,
          recordStream: true
        }
      },
      {
        hostId: 'host_002',
        hostName: 'Mike Chen',
        hostImage: 'https://picsum.photos/seed/100?img=3',
        title: 'Gaming Tournament',
        category: 'gaming',
        channelName: 'channel_gaming_002',
        agoraToken: 'mock_token_002',
        viewerCount: 3400,
        status: 'live',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        coinsEarned: 12000,
        giftsReceived: 89,
        settings: {
          allowGuests: false,
          maxViewers: 10000,
          recordStream: true
        }
      }
    ];

    // Create sample live streams
    for (const stream of sampleStreams) {
      const docRef = adminDb.collection('liveStreams').doc();
      await docRef.set({
        ...stream,
        createdAt: FieldValue.serverTimestamp()
      });
    }

    // 8. Sample transactions
    const sampleTransactions = [
      {
        userId: 'user_001',
        userEmail: 'john.doe@example.com',
        amount: 99.99,
        currency: 'USD',
        paymentMethod: 'credit_card',
        gateway: 'stripe',
        status: 'completed',
        transactionId: 'txn_stripe_001',
        gatewayTransactionId: 'pi_1234567890',
        coins: 10000,
        bonus: 1000,
        description: 'Coin purchase - 10,000 coins',
        metadata: { package: 'premium', bonus_applied: true }
      },
      {
        userId: 'user_002',
        userEmail: 'jane.smith@example.com',
        amount: 49.99,
        currency: 'USD',
        paymentMethod: 'paypal',
        gateway: 'paypal',
        status: 'completed',
        transactionId: 'txn_paypal_001',
        gatewayTransactionId: 'PAYID_1234567890',
        coins: 5000,
        description: 'Coin purchase - 5,000 coins'
      }
    ];

    // Create sample transactions
    for (const transaction of sampleTransactions) {
      const docRef = adminDb.collection('transactions').doc();
      await docRef.set({
        ...transaction,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: FieldValue.serverTimestamp()
      });
    }

    // 9. Sample notifications
    const sampleNotifications = [
      {
        title: 'Welcome to ALKASSER!',
        body: 'Thank you for joining our platform. Enjoy your stay!',
        type: 'in_app',
        status: 'sent',
        data: { type: 'welcome', source: 'system' }
      },
      {
        title: 'New Live Stream Started',
        body: 'Sarah Johnson started a new live stream. Join now!',
        type: 'push',
        status: 'sent',
        data: { type: 'live_stream', streamId: 'stream_001' }
      }
    ];

    // Create sample notifications
    for (const notification of sampleNotifications) {
      const docRef = adminDb.collection('notifications').doc();
      await docRef.set({
        ...notification,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        sentAt: FieldValue.serverTimestamp()
      });
    }

    // 10. Sample moderation reports
    const sampleReports = [
      {
        userId: 'user_003',
        contentType: 'text',
        contentId: 'post_001',
        contentText: 'This is a test post with some content',
        violationType: 'spam',
        confidence: 0.85,
        status: 'pending',
        action: 'none',
        aiDetected: true,
        userReported: false
      },
      {
        userId: 'user_004',
        contentType: 'image',
        contentId: 'image_001',
        contentUrl: 'https://example.com/image.jpg',
        violationType: 'inappropriate',
        confidence: 0.92,
        status: 'pending',
        action: 'none',
        aiDetected: true,
        userReported: true
      }
    ];

    // Create sample moderation reports
    for (const report of sampleReports) {
      const docRef = adminDb.collection('moderationReports').doc();
      await docRef.set({
        ...report,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    console.log('Firebase collections initialized successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error initializing Firebase collections:', error);
    return { success: false, error };
  }
};

// Update real-time data
export const updateRealTimeData = async () => {
  try {
    // Simulate real-time updates
    const dashboardStatsRef = adminDb.collection('realtime').doc('dashboardStats');
    
    // Update with random variations
    const currentStats = await dashboardStatsRef.get();
    if (currentStats.exists) {
      const stats = currentStats.data();
      await dashboardStatsRef.update({
        activeUsers: Math.max(15000, stats.activeUsers + Math.floor(Math.random() * 200 - 100)),
        newUsersToday: stats.newUsersToday + Math.floor(Math.random() * 5),
        revenue: stats.revenue + Math.floor(Math.random() * 1000),
        lastUpdated: FieldValue.serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating real-time data:', error);
    return { success: false, error };
  }
};

// Create sample analytics data
export const createSampleAnalyticsData = async () => {
  try {
    const analyticsEvents = [
      { eventName: 'page_view', properties: { page: '/dashboard' } },
      { eventName: 'user_login', properties: { method: 'email' } },
      { eventName: 'coin_purchase', properties: { amount: 10000, gateway: 'stripe' } },
      { eventName: 'live_stream_join', properties: { streamId: 'stream_001' } },
      { eventName: 'notification_sent', properties: { type: 'push' } }
    ];

    // Create sample analytics events
    for (const event of analyticsEvents) {
      const docRef = adminDb.collection('analyticsEvents').doc();
      await docRef.set({
        ...event,
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        sessionId: `session_${Date.now()}`,
        timestamp: FieldValue.serverTimestamp(),
        platform: 'admin'
      });
    }

    console.log('Sample analytics data created successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error creating sample analytics data:', error);
    return { success: false, error };
  }
};

export default initializeFirebaseCollections;
