import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ModerationConfig {
  id: string;
  sightengineUser: string;
  sightengineApiSecret: string;
  autoModerateImages: boolean;
  autoModerateText: boolean;
  autoModerateVideo: boolean;
  imageThreshold: number;
  textThreshold: number;
  videoThreshold: number;
  bannedKeywords: string[];
  bannedImageCategories: string[];
  actionOnViolation: 'warn' | 'block' | 'delete';
  enabled: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ModerationReport {
  id: string;
  userId: string;
  contentType: 'image' | 'text' | 'video' | 'profile' | 'live_stream';
  contentId: string;
  contentUrl?: string;
  contentText?: string;
  violationType: 'nudity' | 'violence' | 'spam' | 'hate' | 'inappropriate' | 'copyright' | 'other';
  confidence: number;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  action: 'none' | 'warning' | 'suspension' | 'ban' | 'content_removed';
  reviewedBy?: string;
  reviewedAt?: any;
  notes?: string;
  aiDetected: boolean;
  userReported: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface BannedContent {
  id: string;
  type: 'keyword' | 'image_hash' | 'user_id' | 'domain';
  value: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  active: boolean;
  addedBy: string;
  createdAt: any;
  updatedAt: any;
}

// Get moderation configuration
export const getModerationConfig = async (): Promise<ModerationConfig | null> => {
  try {
    const configDoc = await getDocs(collection(db, 'moderationConfig'));
    if (!configDoc.empty) {
      return configDoc.docs[0].data() as ModerationConfig;
    }
    return null;
  } catch (error) {
    console.error('Error fetching moderation config:', error);
    return null;
  }
};

// Update moderation configuration
export const updateModerationConfig = async (configId: string, config: Partial<ModerationConfig>) => {
  try {
    const configRef = doc(db, 'moderationConfig', configId);
    await updateDoc(configRef, {
      ...config,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating moderation config:', error);
    return false;
  }
};

// Analyze image with Sightengine
export const analyzeImage = async (imageUrl: string, config: ModerationConfig): Promise<any> => {
  try {
    if (!config.sightengineUser || !config.sightengineApiSecret) {
      throw new Error('Sightengine credentials not configured');
    }

    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('models', 'nudity,wad,offensive,gore');
    formData.append('api_user', config.sightengineUser);
    formData.append('api_secret', config.sightengineApiSecret);

    const response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        error: result
      };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error
    };
  }
};

// Analyze text for violations
export const analyzeText = (text: string, config: ModerationConfig): any => {
  try {
    const violations = [];
    let totalConfidence = 0;

    // Check for banned keywords
    const lowerText = text.toLowerCase();
    config.bannedKeywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        violations.push({
          type: 'banned_keyword',
          keyword: keyword,
          confidence: 0.9
        });
        totalConfidence = Math.max(totalConfidence, 0.9);
      }
    });

    // Check for spam patterns
    const spamPatterns = [
      /(http|https):\/\/[^\s]+/gi,
      /\b\d{4,}\s*\d{4,}\s*\d{4,}\b/gi, // Credit card patterns
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi // Email patterns
    ];

    spamPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        violations.push({
          type: 'spam_pattern',
          pattern: pattern.toString(),
          confidence: 0.7
        });
        totalConfidence = Math.max(totalConfidence, 0.7);
      }
    });

    return {
      success: true,
      violations,
      confidence: totalConfidence,
      shouldModerate: totalConfidence >= config.textThreshold
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      success: false,
      error
    };
  }
};

// Create moderation report
export const createModerationReport = async (report: Omit<ModerationReport, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const reportRef = await addDoc(collection(db, 'moderationReports'), {
      ...report,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return reportRef.id;
  } catch (error) {
    console.error('Error creating moderation report:', error);
    throw error;
  }
};

// Get moderation reports
export const getModerationReports = async (filters?: {
  status?: string;
  contentType?: string;
  aiDetected?: boolean;
  userReported?: boolean;
}): Promise<ModerationReport[]> => {
  try {
    let reportsQuery = query(collection(db, 'moderationReports'), orderBy('createdAt', 'desc'));
    
    if (filters?.status) {
      reportsQuery = query(reportsQuery, where('status', '==', filters.status));
    }
    
    if (filters?.contentType) {
      reportsQuery = query(reportsQuery, where('contentType', '==', filters.contentType));
    }
    
    if (filters?.aiDetected !== undefined) {
      reportsQuery = query(reportsQuery, where('aiDetected', '==', filters.aiDetected));
    }
    
    if (filters?.userReported !== undefined) {
      reportsQuery = query(reportsQuery, where('userReported', '==', filters.userReported));
    }
    
    const snapshot = await getDocs(reportsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ModerationReport));
  } catch (error) {
    console.error('Error fetching moderation reports:', error);
    return [];
  }
};

// Update moderation report
export const updateModerationReport = async (reportId: string, updates: Partial<ModerationReport>) => {
  try {
    const reportRef = doc(db, 'moderationReports', reportId);
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating moderation report:', error);
    return false;
  }
};

// Add banned content
export const addBannedContent = async (content: Omit<BannedContent, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const contentRef = await addDoc(collection(db, 'bannedContent'), {
      ...content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return contentRef.id;
  } catch (error) {
    console.error('Error adding banned content:', error);
    throw error;
  }
};

// Get banned content
export const getBannedContent = async (type?: string): Promise<BannedContent[]> => {
  try {
    let contentQuery = query(collection(db, 'bannedContent'), where('active', '==', true));
    
    if (type) {
      contentQuery = query(contentQuery, where('type', '==', type));
    }
    
    const snapshot = await getDocs(contentQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BannedContent));
  } catch (error) {
    console.error('Error fetching banned content:', error);
    return [];
  }
};

// Auto-moderate content
export const autoModerateContent = async (
  contentId: string,
  contentType: ModerationReport['contentType'],
  content: { text?: string; imageUrl?: string; videoUrl?: string },
  userId: string
) => {
  try {
    const config = await getModerationConfig();
    if (!config?.enabled) {
      return { success: false, message: 'Moderation not enabled' };
    }

    const reports = [];

    // Analyze text if provided
    if (content.text && config.autoModerateText) {
      const textAnalysis = analyzeText(content.text, config);
      if (textAnalysis.success && textAnalysis.shouldModerate) {
        reports.push({
          userId,
          contentType,
          contentId,
          contentText: content.text,
          violationType: 'inappropriate' as const,
          confidence: textAnalysis.confidence,
          status: 'pending' as const,
          action: 'none' as const,
          aiDetected: true,
          userReported: false
        });
      }
    }

    // Analyze image if provided
    if (content.imageUrl && config.autoModerateImages) {
      const imageAnalysis = await analyzeImage(content.imageUrl, config);
      if (imageAnalysis.success) {
        const { data } = imageAnalysis;
        
        // Check for violations
        if (data.nudity?.sexual_activity > config.imageThreshold ||
            data.nudity?.sexual_display > config.imageThreshold ||
            data.nudity?.suggestive > config.imageThreshold ||
            data.weapon > 0.5 ||
            data.alcohol > 0.5 ||
            data.offensive?.prob > config.imageThreshold) {
          
          reports.push({
            userId,
            contentType,
            contentId,
            contentUrl: content.imageUrl,
            violationType: 'nudity' as const,
            confidence: Math.max(
              data.nudity?.sexual_activity || 0,
              data.nudity?.sexual_display || 0,
              data.nudity?.suggestive || 0,
              data.weapon || 0,
              data.alcohol || 0,
              data.offensive?.prob || 0
            ),
            status: 'pending' as const,
            action: 'none' as const,
            aiDetected: true,
            userReported: false
          });
        }
      }
    }

    // Create reports for violations
    if (reports.length > 0) {
      await Promise.all(
        reports.map(report => createModerationReport(report))
      );
    }

    return {
      success: true,
      reports: reports.length,
      violations: reports
    };
  } catch (error) {
    console.error('Error auto-moderating content:', error);
    return {
      success: false,
      error
    };
  }
};

// Get moderation statistics
export const getModerationStats = async () => {
  try {
    const reportsSnapshot = await getDocs(collection(db, 'moderationReports'));
    const reports = reportsSnapshot.docs.map(doc => doc.data() as ModerationReport);
    
    const totalReports = reports.length;
    const aiDetected = reports.filter(r => r.aiDetected).length;
    const userReported = reports.filter(r => r.userReported).length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const reviewed = reports.filter(r => r.status === 'reviewed').length;
    const approved = reports.filter(r => r.status === 'approved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;

    const statsByType = reports.reduce((acc, r) => {
      acc[r.contentType] = (acc[r.contentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statsByViolation = reports.reduce((acc, r) => {
      acc[r.violationType] = (acc[r.violationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalReports,
      aiDetected,
      userReported,
      pending,
      reviewed,
      approved,
      rejected,
      reviewRate: totalReports > 0 ? (reviewed / totalReports) * 100 : 0,
      approvalRate: reviewed > 0 ? (approved / reviewed) * 100 : 0,
      statsByType,
      statsByViolation
    };
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    return {
      total: 0,
      aiDetected: 0,
      userReported: 0,
      pending: 0,
      reviewed: 0,
      approved: 0,
      rejected: 0,
      reviewRate: 0,
      approvalRate: 0,
      statsByType: {},
      statsByViolation: {}
    };
  }
};
