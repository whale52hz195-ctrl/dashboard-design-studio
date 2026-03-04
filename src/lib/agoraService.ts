import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AgoraConfig {
  appId: string;
  appCertificate: string;
  channelName: string;
  uid: number;
  token?: string;
}

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  hostImage: string;
  title: string;
  category: string;
  channelName: string;
  agoraToken: string;
  viewerCount: number;
  status: 'live' | 'ended' | 'scheduled';
  startTime: any;
  endTime?: any;
  duration?: number;
  coinsEarned: number;
  giftsReceived: number;
  settings: {
    allowGuests: boolean;
    maxViewers: number;
    recordStream: boolean;
  };
}

// Get Agora configuration from Firestore
export const getAgoraConfig = async (): Promise<AgoraConfig | null> => {
  try {
    const configDoc = await getDocs(collection(db, 'agoraConfig'));
    if (!configDoc.empty) {
      const config = configDoc.docs[0].data();
      return {
        appId: config.appId || '',
        appCertificate: config.appCertificate || '',
        channelName: '',
        uid: 0,
        token: ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Agora config:', error);
    return null;
  }
};

// Create a new live stream
export const createLiveStream = async (streamData: Omit<LiveStream, 'id' | 'viewerCount' | 'coinsEarned' | 'giftsReceived'>) => {
  try {
    const streamRef = await addDoc(collection(db, 'liveStreams'), {
      ...streamData,
      viewerCount: 0,
      coinsEarned: 0,
      giftsReceived: 0,
      createdAt: new Date()
    });
    return streamRef.id;
  } catch (error) {
    console.error('Error creating live stream:', error);
    throw error;
  }
};

// Get all live streams
export const getLiveStreams = async (): Promise<LiveStream[]> => {
  try {
    const streamsQuery = query(collection(db, 'liveStreams'), orderBy('startTime', 'desc'));
    const snapshot = await getDocs(streamsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LiveStream));
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return [];
  }
};

// Subscribe to live streams updates
export const subscribeToLiveStreams = (callback: (streams: LiveStream[]) => void) => {
  const streamsQuery = query(collection(db, 'liveStreams'), orderBy('startTime', 'desc'));
  
  return onSnapshot(streamsQuery, (snapshot) => {
    const streams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LiveStream));
    callback(streams);
  });
};

// Update stream viewer count
export const updateStreamViewerCount = async (streamId: string, viewerCount: number) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    await updateDoc(streamRef, {
      viewerCount,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error updating viewer count:', error);
    throw error;
  }
};

// End live stream
export const endLiveStream = async (streamId: string) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    await updateDoc(streamRef, {
      status: 'ended',
      endTime: new Date(),
      duration: 0 // Will be calculated on the frontend
    });
  } catch (error) {
    console.error('Error ending live stream:', error);
    throw error;
  }
};

// Update stream coins and gifts
export const updateStreamEarnings = async (streamId: string, coinsEarned: number, giftsReceived: number) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    await updateDoc(streamRef, {
      coinsEarned,
      giftsReceived,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error updating stream earnings:', error);
    throw error;
  }
};

// Get stream statistics
export const getStreamStats = async (streamId: string) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    const streamDoc = await getDoc(streamRef);
    if (streamDoc.exists()) {
      return streamDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching stream stats:', error);
    return null;
  }
};
