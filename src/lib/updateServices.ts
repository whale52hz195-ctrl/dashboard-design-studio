// Update existing services to use real Firebase data

import { RealApiService } from './realApiService';
import { AgoraRealService } from './agoraRealService';
import { PaymentRealService } from './paymentRealService';
import { NotificationRealService } from './notificationRealService';
import { ModerationRealService } from './moderationRealService';

// Update Dashboard to use real data
export const getRealDashboardStats = async () => {
  try {
    const [dashboardStats, userStats, liveStreams, transactions] = await Promise.all([
      RealApiService.getDashboardStats(),
      RealApiService.getUserStats(),
      RealApiService.getLiveStreams(),
      RealApiService.getTransactions(10)
    ]);

    return {
      ...dashboardStats,
      userStats,
      recentLiveStreams: liveStreams.slice(0, 5),
      recentTransactions: transactions.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting real dashboard stats:', error);
    throw error;
  }
};

// Update Live Streaming to use real Agora
export const createRealLiveStream = async (streamData: any) => {
  try {
    const result = await AgoraRealService.createLiveStream(streamData);
    
    if (result.success) {
      // Store in Firebase
      await RealApiService.createLiveStream(result.streamData);
    }
    
    return result;
  } catch (error) {
    console.error('Error creating real live stream:', error);
    throw error;
  }
};

// Update Payment to use real gateways
export const processRealPayment = async (paymentData: any) => {
  try {
    const result = await PaymentRealService.processPayment(paymentData);
    return result;
  } catch (error) {
    console.error('Error processing real payment:', error);
    throw error;
  }
};

// Update Notifications to use real service
export const sendRealNotification = async (notificationData: any) => {
  try {
    const result = await NotificationRealService.sendNotification(notificationData);
    return result;
  } catch (error) {
    console.error('Error sending real notification:', error);
    throw error;
  }
};

// Update Moderation to use real service
export const autoModerateRealContent = async (contentId: string, contentType: string, content: any, userId: string) => {
  try {
    const result = await ModerationRealService.autoModerateContent(contentId, contentType, content, userId);
    return result;
  } catch (error) {
    console.error('Error auto-moderating real content:', error);
    throw error;
  }
};

// Real-time subscriptions
export const subscribeToRealDashboard = (callback: (data: any) => void) => {
  const unsubscribeStats = RealApiService.subscribeToDashboardStats(callback);
  const unsubscribeStreams = RealApiService.subscribeToLiveStreams((streams) => {
    callback({ liveStreams: streams });
  });
  const unsubscribeTransactions = RealApiService.subscribeToTransactions((transactions) => {
    callback({ recentTransactions: transactions });
  });

  return () => {
    unsubscribeStats();
    unsubscribeStreams();
    unsubscribeTransactions();
  };
};

// Export all real services
export {
  RealApiService,
  AgoraRealService,
  PaymentRealService,
  NotificationRealService,
  ModerationRealService
};
