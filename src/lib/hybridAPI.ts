import { doc, getDoc, getDocs, collection, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Client SDK for all operations (browser-safe)
export const clientAPI = {
  async getAPIConfigs() {
    try {
      console.log('📥 Client SDK: Fetching API configs...');
      const snapshot = await getDocs(collection(db, 'APIs'));
      const configs: Record<string, any> = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        configs[doc.id] = {
          id: doc.id,
          ...doc.data(),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        };
      });
      
      console.log('✅ Client SDK: Loaded configs:', Object.keys(configs));
      return configs;
    } catch (error) {
      console.error('❌ Client SDK: Error fetching API configs:', error);
      throw error;
    }
  },

  async getAPIConfig(apiName: string) {
    try {
      const docRef = doc(db, 'APIs', apiName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          name: apiName,
          displayName: data.displayName || apiName,
          description: data.description || '',
          category: data.category || 'other',
          isActive: data.isActive || false,
          credentials: data.credentials || {},
          settings: data.settings || {},
          usage: data.usage || {},
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching API config for ${apiName}:`, error);
      throw error;
    }
  },

  async updateAPIConfig(apiName: string, updateData: any) {
    try {
      console.log(`🔧 Client SDK: Updating ${apiName} with:`, updateData);
      const docRef = doc(db, 'APIs', apiName);
      
      // Convert dates to Firestore timestamps
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };
      
      if (updateData.createdAt) {
        (dataToUpdate as any).createdAt = serverTimestamp();
      }
      
      await updateDoc(docRef, dataToUpdate);
      console.log(`✅ Client SDK: Successfully updated ${apiName}`);
      return true;
    } catch (error) {
      console.error(`❌ Client SDK: Error updating API config for ${apiName}:`, error);
      throw error;
    }
  },

  async toggleAPIStatus(apiName: string, isActive: boolean) {
    try {
      console.log(`🔧 Client SDK: Toggling ${apiName} to ${isActive}`);
      const docRef = doc(db, 'APIs', apiName);
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Client SDK: Successfully toggled ${apiName}`);
      return true;
    } catch (error) {
      console.error(`❌ Client SDK: Error toggling API status for ${apiName}:`, error);
      throw error;
    }
  },

  async switchAPIMode(apiName: string, isTestMode: boolean) {
    try {
      console.log(`🔧 Client SDK: Switching ${apiName} to ${isTestMode ? 'test' : 'live'} mode`);
      const docRef = doc(db, 'APIs', apiName);
      const updates: any = {
        'settings.testMode': isTestMode,
        updatedAt: serverTimestamp(),
      };
      
      // Get current config for payment APIs
      const config = await clientAPI.getAPIConfig(apiName);
      if (config && config.category === 'payment') {
        const credentials = config.credentials;
        
        if (isTestMode) {
          // Switch to test mode
          if (credentials.liveSecretKey && credentials.livePublicKey) {
            updates['credentials.testSecretKey'] = credentials.liveSecretKey;
            updates['credentials.testPublicKey'] = credentials.livePublicKey;
            updates['credentials.liveSecretKey'] = '';
            updates['credentials.livePublicKey'] = '';
          }
        } else {
          // Switch to live mode
          if (credentials.testSecretKey && credentials.testPublicKey) {
            updates['credentials.liveSecretKey'] = credentials.testSecretKey;
            updates['credentials.livePublicKey'] = credentials.testPublicKey;
            updates['credentials.testSecretKey'] = '';
            updates['credentials.testPublicKey'] = '';
          }
        }
        
        // For Razorpay
        if (apiName === 'razorpay') {
          if (isTestMode) {
            if (credentials.liveKey) {
              updates['credentials.testKey'] = credentials.liveKey;
              updates['credentials.liveKey'] = '';
            }
          } else {
            if (credentials.testKey) {
              updates['credentials.liveKey'] = credentials.testKey;
              updates['credentials.testKey'] = '';
            }
          }
        }
      }
      
      console.log('🔧 Client SDK: Updates to apply:', updates);
      await updateDoc(docRef, updates);
      console.log(`✅ Client SDK: Successfully switched ${apiName} mode`);
      return true;
    } catch (error) {
      console.error(`❌ Client SDK: Error switching API mode for ${apiName}:`, error);
      throw error;
    }
  },

  async testAPIConnection(apiName: string) {
    try {
      console.log(`🔍 Testing connection for ${apiName}...`);
      const config = await clientAPI.getAPIConfig(apiName);
      
      if (!config) {
        throw new Error(`API configuration not found for ${apiName}`);
      }
      
      // Mock connection test - in real implementation, you'd test actual API connectivity
      const hasCredentials = Object.values(config.credentials || {}).some((val: any) => val && typeof val === 'string' && val.trim() !== '');
      
      if (!hasCredentials) {
        throw new Error('No valid credentials found');
      }
      
      console.log(`✅ Connection test successful for ${apiName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error testing connection for ${apiName}:`, error);
      throw error;
    }
  }
};

// Export the client API as default (browser-safe)
export const hybridAPI = {
  // All operations use Client SDK (browser-safe)
  getAPIConfigs: clientAPI.getAPIConfigs,
  getAPIConfig: clientAPI.getAPIConfig,
  updateAPIConfig: clientAPI.updateAPIConfig,
  toggleAPIStatus: clientAPI.toggleAPIStatus,
  switchAPIMode: clientAPI.switchAPIMode,
  testAPIConnection: clientAPI.testAPIConnection,
  
  // Stats
  async getAPIStats() {
    try {
      const configs = await clientAPI.getAPIConfigs();
      const apis = Object.values(configs);
      
      return {
        total: apis.length,
        active: apis.filter(api => api.isActive).length,
        configured: apis.filter(api => 
          api.credentials && Object.values(api.credentials).some(value => 
            value && typeof value === 'string' && value.trim() !== ''
          )
        ).length,
        categories: [...new Set(apis.map(api => api.category || 'other'))],
      };
    } catch (error) {
      console.error('Error fetching API stats:', error);
      // Return default stats on error
      return {
        total: 0,
        active: 0,
        configured: 0,
        categories: [],
      };
    }
  }
};

// Export the hybrid approach as default
export default hybridAPI;
