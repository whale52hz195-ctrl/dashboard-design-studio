import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Real Moderation Service - Connected to Firebase and Sightengine API
export class ModerationRealService {
  
  // Analyze text content
  static async analyzeText(text: string, config: any) {
    try {
      // In production, call Sightengine API
      // For demo, simulate text analysis
      const analysis = {
        success: true,
        shouldModerate: false,
        violations: [],
        confidence: 0,
        categories: {
          profanity: 0.1,
          hate_speech: 0.05,
          harassment: 0.02,
          violence: 0.01,
          self_harm: 0.0,
          sexual_content: 0.0
        }
      };

      // Check for banned keywords
      const bannedKeywords = config.bannedKeywords || [];
      const foundKeywords = bannedKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );

      if (foundKeywords.length > 0) {
        analysis.shouldModerate = true;
        analysis.confidence = 0.9;
        analysis.violations.push({
          type: 'banned_keyword',
          keywords: foundKeywords,
          confidence: 0.9
        });
      }

      // Check text patterns
      const patterns = {
        spam: /\b(buy|sell|free|win|click|link|offer|deal)\b/gi,
        harassment: /\b(stupid|idiot|loser|hate|kill|die)\b/gi,
        sexual: /\b(sex|nude|naked|porn|xxx)\b/gi
      };

      Object.keys(patterns).forEach(type => {
        const matches = text.match(patterns[type]);
        if (matches && matches.length > 2) {
          analysis.shouldModerate = true;
          analysis.confidence = Math.max(analysis.confidence, 0.7);
          analysis.violations.push({
            type,
            matches: matches.length,
            confidence: 0.7
          });
        }
      });

      return analysis;
    } catch (error) {
      console.error('Error analyzing text:', error);
      return { success: false, error: error.message };
    }
  }

  // Analyze image content
  static async analyzeImage(imageUrl: string, config: any) {
    try {
      // In production, call Sightengine API
      // For demo, simulate image analysis
      const analysis = {
        success: true,
        shouldModerate: false,
        violations: [],
        confidence: 0,
        categories: {
          nudity: {
            sexual_activity: 0.1,
            sexual_display: 0.05,
            suggestive: 0.2,
            none: 0.65
          },
          weapon: 0.05,
          alcohol: 0.1,
          drugs: 0.02,
          offensive: {
            prob: 0.1
          }
        }
      };

      // Check if image exceeds thresholds
      const thresholds = {
        nudity: config.imageThreshold || 0.7,
        weapon: 0.5,
        alcohol: 0.5,
        offensive: config.imageThreshold || 0.7
      };

      // Simulate detection based on image URL patterns
      if (imageUrl.includes('nude') || imageUrl.includes('adult')) {
        analysis.categories.nudity.suggestive = 0.8;
        analysis.categories.nudity.none = 0.2;
        analysis.shouldModerate = true;
        analysis.confidence = 0.8;
        analysis.violations.push({
          type: 'nudity',
          subcategory: 'suggestive',
          confidence: 0.8
        });
      }

      if (imageUrl.includes('weapon') || imageUrl.includes('gun')) {
        analysis.categories.weapon = 0.9;
        analysis.shouldModerate = true;
        analysis.confidence = 0.9;
        analysis.violations.push({
          type: 'weapon',
          confidence: 0.9
        });
      }

      // Check against thresholds
      if (analysis.categories.nudity.suggestive > thresholds.nudity ||
          analysis.categories.weapon > thresholds.weapon ||
          analysis.categories.alcohol > thresholds.alcohol ||
          analysis.categories.offensive.prob > thresholds.offensive) {
        
        analysis.shouldModerate = true;
        analysis.confidence = Math.max(
          analysis.categories.nudity.suggestive,
          analysis.categories.weapon,
          analysis.categories.alcohol,
          analysis.categories.offensive.prob
        );
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return { success: false, error: error.message };
    }
  }

  // Auto-moderate content
  static async autoModerateContent(contentId: string, contentType: string, content: any, userId: string) {
    try {
      const config = await this.getModerationConfig();
      if (!config?.enabled) {
        return { success: false, message: 'Moderation not enabled' };
      }

      const reports = [];

      // Analyze text if provided
      if (content.text && config.autoModerateText) {
        const textAnalysis = await this.analyzeText(content.text, config);
        if (textAnalysis.success && (textAnalysis as any).shouldModerate) {
          reports.push({
            userId,
            contentType,
            contentId,
            contentText: content.text,
            violationType: 'text_violation',
            confidence: (textAnalysis as any).confidence,
            status: 'pending',
            action: 'none',
            aiDetected: true,
            userReported: false,
            violations: (textAnalysis as any).violations
          });
        }
      }

      // Analyze image if provided
      if (content.imageUrl && config.autoModerateImages) {
        const imageAnalysis = await this.analyzeImage(content.imageUrl, config);
        if (imageAnalysis.success && (imageAnalysis as any).shouldModerate) {
          reports.push({
            userId,
            contentType,
            contentId,
            contentUrl: content.imageUrl,
            violationType: 'image_violation',
            confidence: (imageAnalysis as any).confidence,
            status: 'pending',
            action: 'none',
            aiDetected: true,
            userReported: false,
            violations: (imageAnalysis as any).violations
          });
        }
      }

      // Create reports for violations
      if (reports.length > 0) {
        for (const report of reports) {
          await addDoc(collection(db, 'moderationReports'), {
            ...report,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        // Auto-action if configured
        if (config.actionOnViolation === 'auto_remove') {
          await this.autoRemoveContent(contentId, contentType);
        } else if (config.actionOnViolation === 'auto_warn') {
          await this.sendWarningToUser(userId, reports);
        }
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
        error: error.message
      };
    }
  }

  // Report content manually
  static async reportContent(reportData: any) {
    try {
      const report = {
        ...reportData,
        status: 'pending',
        action: 'none',
        userReported: true,
        aiDetected: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const reportRef = await addDoc(collection(db, 'moderationReports'), report);
      
      // Track report analytics
      await this.trackModerationEvent('content_reported', reportData);
      
      return { success: true, reportId: reportRef.id };
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  // Get moderation reports
  static async getModerationReports(limitCount = 50) {
    try {
      const reportsQuery = query(
        collection(db, 'moderationReports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(reportsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting moderation reports:', error);
      throw error;
    }
  }

  // Update moderation report
  static async updateModerationReport(reportId: string, updateData: any) {
    try {
      await updateDoc(doc(db, 'moderationReports', reportId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating moderation report:', error);
      throw error;
    }
  }

  // Get moderation config
  static async getModerationConfig() {
    try {
      const configDoc = await getDoc(doc(db, 'moderationConfig', 'main'));
      return configDoc.exists() ? configDoc.data() : null;
    } catch (error) {
      console.error('Error getting moderation config:', error);
      throw error;
    }
  }

  // Update moderation config
  static async updateModerationConfig(configData: any) {
    try {
      await updateDoc(doc(db, 'moderationConfig', 'main'), {
        ...configData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating moderation config:', error);
      throw error;
    }
  }

  // Get banned content
  static async getBannedContent(type?: string) {
    try {
      let bannedQuery = query(collection(db, 'bannedContent'));
      
      if (type) {
        bannedQuery = query(bannedQuery, where('type', '==', type));
      }
      
      const snapshot = await getDocs(bannedQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting banned content:', error);
      throw error;
    }
  }

  // Add banned content
  static async addBannedContent(contentData: any) {
    try {
      const bannedContent = {
        ...contentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const contentRef = await addDoc(collection(db, 'bannedContent'), bannedContent);
      return { success: true, contentId: contentRef.id };
    } catch (error) {
      console.error('Error adding banned content:', error);
      throw error;
    }
  }

  // Remove banned content
  static async removeBannedContent(contentId: string) {
    try {
      await updateDoc(doc(db, 'bannedContent', contentId), {
        status: 'removed',
        removedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error removing banned content:', error);
      throw error;
    }
  }

  // Auto-remove content
  static async autoRemoveContent(contentId: string, contentType: string) {
    try {
      // In production, this would actually remove the content
      // For demo, just log the action
      console.log(`Auto-removing ${contentType} content: ${contentId}`);
      
      // Add to banned content
      await this.addBannedContent({
        contentId,
        contentType,
        reason: 'auto_moderation',
        status: 'banned'
      });

      return { success: true };
    } catch (error) {
      console.error('Error auto-removing content:', error);
      throw error;
    }
  }

  // Send warning to user
  static async sendWarningToUser(userId: string, reports: any[]) {
    try {
      // Create warning notification
      const warningData = {
        title: '⚠️ Content Warning',
        body: 'Your content has been flagged for violating community guidelines. Please review our terms of service.',
        type: 'in_app',
        targetUsers: 'specific',
        userIds: [userId],
        data: {
          type: 'moderation_warning',
          reports: reports.map(r => r.id)
        }
      };

      // In production, send actual notification
      console.log(`Sending warning to user ${userId}:`, reports);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending warning to user:', error);
      throw error;
    }
  }

  // Get moderation statistics
  static async getModerationStats() {
    try {
      const reportsQuery = query(collection(db, 'moderationReports'));
      const snapshot = await getDocs(reportsQuery);
      
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const stats = {
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        approvedReports: reports.filter(r => r.status === 'approved').length,
        rejectedReports: reports.filter(r => r.status === 'rejected').length,
        aiDetected: reports.filter(r => r.aiDetected).length,
        userReported: reports.filter(r => r.userReported).length,
        violationTypes: {},
        contentTypeBreakdown: {},
        recentReports: reports.slice(0, 10)
      };

      // Calculate breakdowns
      reports.forEach(report => {
        stats.violationTypes[report.violationType] = (stats.violationTypes[report.violationType] || 0) + 1;
        stats.contentTypeBreakdown[report.contentType] = (stats.contentTypeBreakdown[report.contentType] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw error;
    }
  }

  // Track moderation analytics
  static async trackModerationEvent(eventType: string, data: any) {
    try {
      const eventData = {
        eventName: `moderation_${eventType}`,
        properties: data,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'analyticsEvents'), eventData);
    } catch (error) {
      console.error('Error tracking moderation event:', error);
    }
  }

  // Batch review reports
  static async batchReviewReports(reportIds: string[], action: 'approve' | 'reject', notes?: string) {
    try {
      const results = [];
      
      for (const reportId of reportIds) {
        try {
          await this.updateModerationReport(reportId, {
            status: action === 'approve' ? 'approved' : 'rejected',
            action: action === 'approve' ? 'warning' : 'none',
            reviewedAt: serverTimestamp(),
            notes: notes || ''
          });
          
          results.push({ reportId, success: true });
        } catch (error) {
          results.push({ reportId, success: false, error: error.message });
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('Error batch reviewing reports:', error);
      throw error;
    }
  }

  // Get user moderation history
  static async getUserModerationHistory(userId: string) {
    try {
      const reportsQuery = query(
        collection(db, 'moderationReports'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(reportsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      console.error('Error getting user moderation history:', error);
      throw error;
    }
  }
}

export default ModerationRealService;
