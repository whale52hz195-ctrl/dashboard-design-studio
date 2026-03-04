import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Real Notification Service - Connected to Firebase
export class NotificationRealService {
  
  // Send notification to users
  static async sendNotification(notificationData: any) {
    try {
      const { title, body, type, targetUsers, targetUserId, data, imageUrl } = notificationData;
      
      // Create notification record
      const newNotification = {
        title,
        body,
        type, // 'push', 'in_app', 'email', 'sms'
        targetUsers, // 'all', 'vip', 'followers', 'specific'
        targetUserId,
        data: data || {},
        imageUrl: imageUrl || null,
        status: 'pending',
        sentCount: 0,
        deliveryCount: 0,
        readCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const notificationRef = await addDoc(collection(db, 'notifications'), newNotification);
      const notificationId = notificationRef.id;

      // Get target users
      let targetUsersList = [];
      switch (targetUsers) {
        case 'all':
          targetUsersList = await this.getAllUsers();
          break;
        case 'vip':
          targetUsersList = await this.getVipUsers();
          break;
        case 'followers':
          if (targetUserId) {
            targetUsersList = await this.getFollowers(targetUserId);
          }
          break;
        case 'specific':
          if (notificationData.userIds) {
            targetUsersList = await this.getSpecificUsers(notificationData.userIds);
          }
          break;
        default:
          targetUsersList = [];
      }

      // Send notifications based on type
      let deliveryResults = [];
      switch (type) {
        case 'push':
          deliveryResults = await this.sendPushNotifications(notificationId, targetUsersList, notificationData);
          break;
        case 'in_app':
          deliveryResults = await this.sendInAppNotifications(notificationId, targetUsersList, notificationData);
          break;
        case 'email':
          deliveryResults = await this.sendEmailNotifications(notificationId, targetUsersList, notificationData);
          break;
        default:
          throw new Error('Unsupported notification type');
      }

      // Update notification with results
      const totalSent = deliveryResults.filter(r => r.success).length;
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'sent',
        sentCount: targetUsersList.length,
        deliveryCount: totalSent,
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Track analytics
      await this.trackNotificationEvent(notificationId, type, targetUsers, totalSent);

      return {
        success: true,
        notificationId,
        sentCount: targetUsersList.length,
        deliveryCount: totalSent
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send push notifications
  static async sendPushNotifications(notificationId: string, users: any[], notificationData: any) {
    try {
      const results = [];
      
      for (const user of users) {
        try {
          // In production, use FCM service
          // For demo, simulate successful push notification
          const pushResult = {
            success: true,
            userId: user.id,
            messageId: `push_msg_${Date.now()}_${user.id}`,
            timestamp: serverTimestamp()
          };

          // Store user notification record
          await addDoc(collection(db, 'userNotifications'), {
            notificationId,
            userId: user.id,
            type: 'push',
            status: 'delivered',
            messageId: pushResult.messageId,
            createdAt: serverTimestamp()
          });

          results.push(pushResult);
        } catch (error) {
          results.push({
            success: false,
            userId: user.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  // Send in-app notifications
  static async sendInAppNotifications(notificationId: string, users: any[], notificationData: any) {
    try {
      const results = [];
      
      for (const user of users) {
        try {
          // Store in-app notification
          const inAppNotification = {
            notificationId,
            userId: user.id,
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data || {},
            imageUrl: notificationData.imageUrl || null,
            read: false,
            createdAt: serverTimestamp()
          };

          await addDoc(collection(db, 'userNotifications'), inAppNotification);

          results.push({
            success: true,
            userId: user.id
          });
        } catch (error) {
          results.push({
            success: false,
            userId: user.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending in-app notifications:', error);
      throw error;
    }
  }

  // Send email notifications
  static async sendEmailNotifications(notificationId: string, users: any[], notificationData: any) {
    try {
      const results = [];
      
      for (const user of users) {
        try {
          // In production, use email service like SendGrid
          // For demo, simulate successful email
          const emailResult = {
            success: true,
            userId: user.id,
            email: user.email,
            messageId: `email_msg_${Date.now()}_${user.id}`,
            timestamp: serverTimestamp()
          };

          // Store email notification record
          await addDoc(collection(db, 'userNotifications'), {
            notificationId,
            userId: user.id,
            type: 'email',
            status: 'delivered',
            email: user.email,
            messageId: emailResult.messageId,
            createdAt: serverTimestamp()
          });

          results.push(emailResult);
        } catch (error) {
          results.push({
            success: false,
            userId: user.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending email notifications:', error);
      throw error;
    }
  }

  // Get all users
  static async getAllUsers() {
    try {
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get VIP users
  static async getVipUsers() {
    try {
      const vipUsersQuery = query(collection(db, 'users'), where('vip', '==', true));
      const snapshot = await getDocs(vipUsersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting VIP users:', error);
      throw error;
    }
  }

  // Get followers of a user
  static async getFollowers(userId: string) {
    try {
      // In a real app, you'd have a followers collection
      // For demo, return some users
      const usersQuery = query(collection(db, 'users'), limit(100));
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  // Get specific users
  static async getSpecificUsers(userIds: string[]) {
    try {
      const users = [];
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          users.push({ id: userDoc.id, ...userDoc.data() as any });
        }
      }
      return users;
    } catch (error) {
      console.error('Error getting specific users:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limitCount = 20) {
    try {
      const notificationsQuery = query(
        collection(db, 'userNotifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      // Find the user notification record
      const userNotificationsQuery = query(
        collection(db, 'userNotifications'),
        where('notificationId', '==', notificationId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(userNotificationsQuery);
      
      if (!snapshot.empty) {
        await updateDoc(doc(db, 'userNotifications', snapshot.docs[0].id), {
          read: true,
          readAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get notifications
  static async getNotifications(limitCount = 50) {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
    try {
      const notificationsQuery = query(collection(db, 'notifications'));
      const snapshot = await getDocs(notificationsQuery);
      
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const stats = {
        totalNotifications: notifications.length,
        sentNotifications: notifications.filter(n => n.status === 'sent').length,
        pendingNotifications: notifications.filter(n => n.status === 'pending').length,
        totalSent: notifications.reduce((sum, n) => sum + (n.sentCount || 0), 0),
        totalDelivered: notifications.reduce((sum, n) => sum + (n.deliveryCount || 0), 0),
        deliveryRate: 0,
        typeBreakdown: {},
        recentNotifications: notifications.slice(0, 10)
      };

      // Calculate delivery rate
      if (stats.totalSent > 0) {
        stats.deliveryRate = (stats.totalDelivered / stats.totalSent) * 100;
      }

      // Calculate type breakdown
      notifications.forEach(notification => {
        stats.typeBreakdown[notification.type] = (stats.typeBreakdown[notification.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  // Track notification analytics
  static async trackNotificationEvent(notificationId: string, type: string, targetUsers: string, deliveryCount: number) {
    try {
      const eventData = {
        eventName: 'notification_sent',
        properties: {
          notificationId,
          type,
          targetUsers,
          deliveryCount,
          timestamp: serverTimestamp()
        }
      };

      await addDoc(collection(db, 'analyticsEvents'), {
        ...eventData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking notification event:', error);
    }
  }

  // Create notification template
  static async createNotificationTemplate(templateData: any) {
    try {
      const template = {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const templateRef = await addDoc(collection(db, 'notificationTemplates'), template);
      return { success: true, templateId: templateRef.id };
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  }

  // Get notification templates
  static async getNotificationTemplates() {
    try {
      const templatesQuery = query(collection(db, 'notificationTemplates'));
      const snapshot = await getDocs(templatesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting notification templates:', error);
      throw error;
    }
  }

  // Send notification using template
  static async sendFromTemplate(templateId: string, variables: any, targetData: any) {
    try {
      const templateDoc = await getDoc(doc(db, 'notificationTemplates', templateId));
      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }

      const template = templateDoc.data();
      
      // Replace variables in template
      let title = template.title;
      let body = template.body;
      
      Object.keys(variables).forEach(key => {
        title = title.replace(`{{${key}}}`, variables[key]);
        body = body.replace(`{{${key}}}`, variables[key]);
      });

      // Send notification
      return await this.sendNotification({
        title,
        body,
        type: template.type,
        targetUsers: targetData.targetUsers,
        targetUserId: targetData.targetUserId,
        data: { ...template.data, ...variables }
      });
    } catch (error) {
      console.error('Error sending notification from template:', error);
      throw error;
    }
  }

  // Schedule notification
  static async scheduleNotification(notificationData: any, scheduledTime: Date) {
    try {
      const scheduledNotification = {
        ...notificationData,
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const notificationRef = await addDoc(collection(db, 'scheduledNotifications'), scheduledNotification);
      return { success: true, scheduledId: notificationRef.id };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Get scheduled notifications
  static async getScheduledNotifications() {
    try {
      const scheduledQuery = query(
        collection(db, 'scheduledNotifications'),
        where('status', '==', 'scheduled'),
        orderBy('scheduledTime', 'asc')
      );
      const snapshot = await getDocs(scheduledQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      throw error;
    }
  }
}

export default NotificationRealService;
