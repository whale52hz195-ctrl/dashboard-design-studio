import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy, where, onSnapshot, serverTimestamp, getDoc, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'push' | 'email' | 'in_app';
  title: string;
  body: string;
  data?: any;
  enabled: boolean;
  triggers: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  body: string;
  type: 'push' | 'email' | 'in_app';
  status: 'pending' | 'sent' | 'failed';
  data?: any;
  fcmToken?: string;
  userEmail?: string;
  scheduledAt?: any;
  sentAt?: any;
  readAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface FCMConfig {
  enabled: boolean;
  serverKey: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Get FCM configuration
export const getFCMConfig = async (): Promise<FCMConfig | null> => {
  try {
    const configDoc = await getDocs(collection(db, 'fcmConfig'));
    if (!configDoc.empty) {
      return configDoc.docs[0].data() as FCMConfig;
    }
    return null;
  } catch (error) {
    console.error('Error fetching FCM config:', error);
    return null;
  }
};

// Update FCM configuration
export const updateFCMConfig = async (config: Partial<FCMConfig>) => {
  try {
    const configRef = doc(db, 'fcmConfig', 'config');
    await updateDoc(configRef, {
      ...config,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating FCM config:', error);
    return false;
  }
};

// Create notification template
export const createNotificationTemplate = async (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const templateRef = await addDoc(collection(db, 'notificationTemplates'), {
      ...template,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return templateRef.id;
  } catch (error) {
    console.error('Error creating notification template:', error);
    throw error;
  }
};

// Get notification templates
export const getNotificationTemplates = async (): Promise<NotificationTemplate[]> => {
  try {
    const templatesQuery = query(collection(db, 'notificationTemplates'), orderBy('name'));
    const snapshot = await getDocs(templatesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NotificationTemplate));
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return [];
  }
};

// Send notification to specific user
export const sendNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>, scheduledAt?: any) => {
  try {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      status: scheduledAt ? 'pending' : 'pending',
      scheduledAt: scheduledAt || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // If not scheduled, try to send immediately
    if (!scheduledAt) {
      await processNotification(notificationRef.id);
    }
    
    return notificationRef.id;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Send bulk notification
export const sendBulkNotification = async (notifications: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>[]) => {
  try {
    const notificationRefs = await Promise.all(
      notifications.map(notification => 
        addDoc(collection(db, 'notifications'), {
          ...notification,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      )
    );
    
    // Process all notifications
    await Promise.all(
      notificationRefs.map(ref => processNotification(ref.id))
    );
    
    return notificationRefs.map(ref => ref.id);
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

// Process notification (send to FCM)
const processNotification = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error('Notification not found');
    }
    
    const notification = notificationDoc.data() as Notification;
    
    // Update status to processing
    await updateDoc(notificationRef, {
      status: 'pending',
      updatedAt: serverTimestamp()
    });
    
    // Send FCM notification if it's a push notification
    if (notification.type === 'push' && notification.fcmToken) {
      const fcmConfig = await getFCMConfig();
      if (fcmConfig?.enabled) {
        const result = await sendFCMNotification(notification, fcmConfig);
        
        await updateDoc(notificationRef, {
          status: result.success ? 'sent' : 'failed',
          sentAt: result.success ? serverTimestamp() : null,
          updatedAt: serverTimestamp()
        });
        
        return result;
      }
    }
    
    // For in-app notifications, mark as sent
    await updateDoc(notificationRef, {
      status: 'sent',
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error processing notification:', error);
    
    // Update status to failed
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      status: 'failed',
      updatedAt: serverTimestamp()
    });
    
    return { success: false, error };
  }
};

// Send FCM notification
const sendFCMNotification = async (notification: Notification, config: FCMConfig) => {
  try {
    const fcmUrl = `https://fcm.googleapis.com/fcm/send`;
    
    const payload = {
      to: notification.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        sound: 'default'
      },
      data: notification.data || {}
    };
    
    const response = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `key=${config.serverKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success === 1) {
      return { success: true, messageId: result.message_id };
    } else {
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return { success: false, error };
  }
};

// Get notifications for user
export const getUserNotifications = async (userId: string, limit = 20) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('type', 'in', ['push', 'in_app']),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(notificationsQuery);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    
    return notifications.slice(0, limit);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
};

// Subscribe to user notifications
export const subscribeToUserNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('type', 'in', ['push', 'in_app']),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    callback(notifications);
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    const notifications = notificationsSnapshot.docs.map(doc => doc.data() as Notification);
    
    const totalSent = notifications.filter(n => n.status === 'sent').length;
    const totalPending = notifications.filter(n => n.status === 'pending').length;
    const totalFailed = notifications.filter(n => n.status === 'failed').length;
    const totalRead = notifications.filter(n => n.readAt).length;
    
    const statsByType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: notifications.length,
      sent: totalSent,
      pending: totalPending,
      failed: totalFailed,
      read: totalRead,
      readRate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0,
      deliveryRate: notifications.length > 0 ? (totalSent / notifications.length) * 100 : 0,
      statsByType
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return {
      total: 0,
      sent: 0,
      pending: 0,
      failed: 0,
      read: 0,
      readRate: 0,
      deliveryRate: 0,
      statsByType: {}
    };
  }
};

// Schedule notification
export const scheduleNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>, scheduledAt: any) => {
  return sendNotification(notification, scheduledAt);
};
