import { collection, doc, onSnapshot, query, orderBy, limit, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Real-time dashboard updates
export const subscribeToDashboardStats = (callback: (stats: any) => void) => {
  const statsDoc = doc(db, 'realtime', 'dashboardStats');
  
  return onSnapshot(statsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  }, (error) => {
    console.error('Error listening to dashboard stats:', error);
  });
};

// Real-time user updates
export const subscribeToUserStats = (callback: (stats: any) => void) => {
  const statsDoc = doc(db, 'realtime', 'userStats');
  
  return onSnapshot(statsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
};

// Real-time live streams
export const subscribeToLiveStreams = (callback: (streams: any[]) => void) => {
  const streamsQuery = query(
    collection(db, 'liveStreams'),
    where('status', '==', 'live'),
    orderBy('viewerCount', 'desc')
  );
  
  return onSnapshot(streamsQuery, (snapshot) => {
    const streams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(streams);
  });
};

// Real-time transactions
export const subscribeToTransactions = (callback: (transactions: any[]) => void) => {
  const transactionsQuery = query(
    collection(db, 'transactions'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(transactionsQuery, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(transactions);
  });
};

// Real-time notifications
export const subscribeToNotifications = (callback: (notifications: any[]) => void) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  });
};

// Update dashboard stats
export const updateDashboardStats = async (stats: any) => {
  const statsDoc = doc(db, 'realtime', 'dashboardStats');
  await updateDoc(statsDoc, {
    ...stats,
    lastUpdated: serverTimestamp()
  });
};

// Create live stream
export const createLiveStream = async (streamData: any) => {
  const streamRef = doc(collection(db, 'liveStreams'));
  await updateDoc(streamRef, {
    ...streamData,
    status: 'live',
    createdAt: serverTimestamp(),
    viewerCount: 0
  });
  return streamRef.id;
};

// Update stream viewer count
export const updateStreamViewerCount = async (streamId: string, viewerCount: number) => {
  const streamRef = doc(db, 'liveStreams', streamId);
  await updateDoc(streamRef, {
    viewerCount,
    lastUpdated: serverTimestamp()
  });
};

// End live stream
export const endLiveStream = async (streamId: string) => {
  const streamRef = doc(db, 'liveStreams', streamId);
  await updateDoc(streamRef, {
    status: 'ended',
    endedAt: serverTimestamp()
  });
};
