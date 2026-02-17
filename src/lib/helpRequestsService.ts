import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface HelpRequestData {
  id?: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    hasHeart?: boolean;
  };
  helpRequest: string;
  contact: string;
  date: string;
  image: string;
  status: 'pending' | 'solved';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

class HelpRequestsService {
  private collectionName = 'helpRequests';

  // Get all help requests
  async getAllHelpRequests(): Promise<HelpRequestData[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpRequestData[];
    } catch (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
  }

  // Get help requests by status
  async getHelpRequestsByStatus(status: 'pending' | 'solved'): Promise<HelpRequestData[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpRequestData[];
    } catch (error) {
      console.error('Error fetching help requests by status:', error);
      throw error;
    }
  }

  // Add new help request
  async addHelpRequest(helpRequest: Omit<HelpRequestData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...helpRequest,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding help request:', error);
      throw error;
    }
  }

  // Update help request status
  async updateHelpRequestStatus(id: string, status: 'pending' | 'solved'): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating help request status:', error);
      throw error;
    }
  }

  // Delete help request
  async deleteHelpRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting help request:', error);
      throw error;
    }
  }

  // Search help requests
  async searchHelpRequests(searchTerm: string): Promise<HelpRequestData[]> {
    try {
      const allRequests = await this.getAllHelpRequests();
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return allRequests.filter(request => 
        request.user.name.toLowerCase().includes(lowerSearchTerm) ||
        request.user.username.toLowerCase().includes(lowerSearchTerm) ||
        request.helpRequest.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching help requests:', error);
      throw error;
    }
  }
}

export const helpRequestsService = new HelpRequestsService();
