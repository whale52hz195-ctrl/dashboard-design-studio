import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string;
  sessionId?: string;
  properties: any;
  platform: 'web' | 'mobile' | 'admin';
  timestamp: any;
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  sessionId: string;
  startTime: any;
  endTime?: any;
  duration?: number;
  pageViews: number;
  events: number;
  platform: string;
  userAgent: string;
  ip: string;
  country?: string;
  city?: string;
  bounceRate: number;
}

export interface PageView {
  id: string;
  sessionId: string;
  userId?: string;
  page: string;
  title: string;
  referrer?: string;
  timestamp: any;
  duration?: number;
  platform: string;
}

export interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  totalPageViews: number;
  uniquePageViews: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; uniqueViews: number }>;
  topEvents: Array<{ eventName: string; count: number }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  conversionRates: {
    registration: number;
    purchase: number;
    engagement: number;
  };
}

// Track analytics event
export const trackEvent = async (eventName: string, properties: any = {}, userId?: string) => {
  try {
    const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = {
      eventName,
      userId,
      sessionId: getSessionId(),
      properties,
      platform: 'admin',
      userAgent: navigator.userAgent,
      ip: await getClientIP(),
      country: properties.country,
      city: properties.city
    };

    await addDoc(collection(db, 'analyticsEvents'), {
      ...event,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Track page view
export const trackPageView = async (page: string, title: string, userId?: string) => {
  try {
    const pageView: Omit<PageView, 'id' | 'timestamp'> = {
      sessionId: getSessionId(),
      userId,
      page,
      title,
      referrer: document.referrer,
      platform: 'admin'
    };

    await addDoc(collection(db, 'pageViews'), {
      ...pageView,
      timestamp: serverTimestamp()
    });

    // Update session
    await updateSession();
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Start user session
export const startSession = async (userId?: string) => {
  try {
    const sessionId = getSessionId();
    const session: Omit<UserSession, 'id' | 'startTime'> = {
      userId,
      sessionId,
      pageViews: 0,
      events: 0,
      platform: 'admin',
      userAgent: navigator.userAgent,
      ip: await getClientIP(),
      bounceRate: 0
    };

    await addDoc(collection(db, 'userSessions'), {
      ...session,
      startTime: serverTimestamp()
    });
  } catch (error) {
    console.error('Error starting session:', error);
  }
};

// Update user session
export const updateSession = async () => {
  try {
    const sessionId = getSessionId();
    const sessionsQuery = query(
      collection(db, 'userSessions'),
      where('sessionId', '==', sessionId),
      where('endTime', '==', null)
    );
    
    const snapshot = await getDocs(sessionsQuery);
    if (!snapshot.empty) {
      const sessionRef = doc(db, 'userSessions', snapshot.docs[0].id);
      await updateDoc(sessionRef, {
        pageViews: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

// End user session
export const endSession = async () => {
  try {
    const sessionId = getSessionId();
    const sessionsQuery = query(
      collection(db, 'userSessions'),
      where('sessionId', '==', sessionId),
      where('endTime', '==', null)
    );
    
    const snapshot = await getDocs(sessionsQuery);
    if (!snapshot.empty) {
      const sessionRef = doc(db, 'userSessions', snapshot.docs[0].id);
      await updateDoc(sessionRef, {
        endTime: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error ending session:', error);
  }
};

// Get analytics stats
export const getAnalyticsStats = async (dateRange?: { start: any; end: any }): Promise<AnalyticsStats> => {
  try {
    const defaultRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };
    
    const range = dateRange || defaultRange;

    // Get user sessions
    const sessionsQuery = query(
      collection(db, 'userSessions'),
      where('startTime', '>=', range.start),
      where('startTime', '<=', range.end),
      orderBy('startTime', 'desc')
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    const sessions = sessionsSnapshot.docs.map(doc => doc.data() as UserSession);

    // Get page views
    const pageViewsQuery = query(
      collection(db, 'pageViews'),
      where('timestamp', '>=', range.start),
      where('timestamp', '<=', range.end),
      orderBy('timestamp', 'desc')
    );
    
    const pageViewsSnapshot = await getDocs(pageViewsQuery);
    const pageViews = pageViewsSnapshot.docs.map(doc => doc.data() as PageView);

    // Get events
    const eventsQuery = query(
      collection(db, 'analyticsEvents'),
      where('timestamp', '>=', range.start),
      where('timestamp', '<=', range.end),
      orderBy('timestamp', 'desc')
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = eventsSnapshot.docs.map(doc => doc.data() as AnalyticsEvent);

    // Calculate stats
    const totalUsers = new Set(sessions.map(s => s.userId).filter(Boolean)).size;
    const activeUsers = new Set(
      sessions
        .filter(s => s.endTime === null)
        .map(s => s.userId)
        .filter(Boolean)
    ).size;
    
    const totalSessions = sessions.length;
    const avgSessionDuration = sessions
      .filter(s => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.filter(s => s.duration).length || 0;
    
    const totalPageViews = pageViews.length;
    const uniquePageViews = new Set(pageViews.map(p => `${p.sessionId}-${p.page}`)).size;
    
    const bounceRate = sessions.filter(s => s.pageViews === 1).length / totalSessions * 100;

    // Top pages
    const pageStats = pageViews.reduce((acc, pv) => {
      if (!acc[pv.page]) {
        acc[pv.page] = { views: 0, uniqueViews: new Set() };
      }
      acc[pv.page].views++;
      acc[pv.page].uniqueViews.add(pv.sessionId);
      return acc;
    }, {} as Record<string, { views: number; uniqueViews: Set<string> }>);

    const topPages = Object.entries(pageStats)
      .map(([page, stats]) => ({
        page,
        views: stats.views,
        uniqueViews: stats.uniqueViews.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top events
    const eventStats = events.reduce((acc, event) => {
      acc[event.eventName] = (acc[event.eventName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEvents = Object.entries(eventStats)
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get revenue data (mock for now)
    const revenue = {
      total: 125000,
      today: 2500,
      thisWeek: 15000,
      thisMonth: 45000
    };

    // Get conversion rates (mock for now)
    const conversionRates = {
      registration: 12.5,
      purchase: 8.3,
      engagement: 45.7
    };

    // Get user retention (mock for now)
    const userRetention = {
      day1: 85.2,
      day7: 62.8,
      day30: 41.3
    };

    return {
      totalUsers,
      activeUsers,
      totalSessions,
      avgSessionDuration,
      totalPageViews,
      uniquePageViews,
      bounceRate,
      topPages,
      topEvents,
      userRetention,
      revenue,
      conversionRates
    };
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      totalPageViews: 0,
      uniquePageViews: 0,
      bounceRate: 0,
      topPages: [],
      topEvents: [],
      userRetention: { day1: 0, day7: 0, day30: 0 },
      revenue: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
      conversionRates: { registration: 0, purchase: 0, engagement: 0 }
    };
  }
};

// Get real-time analytics
export const getRealTimeAnalytics = async () => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get active sessions in last 5 minutes
    const activeSessionsQuery = query(
      collection(db, 'userSessions'),
      where('startTime', '>=', fiveMinutesAgo),
      where('endTime', '==', null)
    );
    
    const activeSessionsSnapshot = await getDocs(activeSessionsQuery);
    const activeSessions = activeSessionsSnapshot.size;

    // Get page views in last 5 minutes
    const recentPageViewsQuery = query(
      collection(db, 'pageViews'),
      where('timestamp', '>=', fiveMinutesAgo)
    );
    
    const recentPageViewsSnapshot = await getDocs(recentPageViewsQuery);
    const recentPageViews = recentPageViewsSnapshot.size;

    // Get events in last 5 minutes
    const recentEventsQuery = query(
      collection(db, 'analyticsEvents'),
      where('timestamp', '>=', fiveMinutesAgo)
    );
    
    const recentEventsSnapshot = await getDocs(recentEventsQuery);
    const recentEvents = recentEventsSnapshot.size;

    return {
      activeUsers: activeSessions,
      pageViews: recentPageViews,
      events: recentEvents,
      timestamp: now
    };
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    return {
      activeUsers: 0,
      pageViews: 0,
      events: 0,
      timestamp: new Date()
    };
  }
};

// Subscribe to real-time analytics
export const subscribeToRealTimeAnalytics = (callback: (data: any) => void) => {
  const interval = setInterval(async () => {
    const data = await getRealTimeAnalytics();
    callback(data);
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
};

// Helper functions
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};
