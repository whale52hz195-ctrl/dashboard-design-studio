// Upload game history data to Firestore
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Sample game history data
const gameHistoryData = [
  {
    adminCoin: 1064680,
    totalBetCoin: 5000,
    winnerCoin: 4500,
    winLose: "WIN",
    info: "Teen Patti Game #1",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1064180,
    totalBetCoin: 3000,
    winnerCoin: 3200,
    winLose: "LOSE",
    info: "Teen Patti Game #2",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1067380,
    totalBetCoin: 2000,
    winnerCoin: 1800,
    winLose: "WIN",
    info: "Teen Patti Game #3",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1065580,
    totalBetCoin: 4000,
    winnerCoin: 4200,
    winLose: "LOSE",
    info: "Teen Patti Game #4",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1069780,
    totalBetCoin: 1500,
    winnerCoin: 1400,
    winLose: "WIN",
    info: "Teen Patti Game #5",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1068280,
    totalBetCoin: 2500,
    winnerCoin: 2300,
    winLose: "WIN",
    info: "Teen Patti Game #6",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1070780,
    totalBetCoin: 3500,
    winnerCoin: 3700,
    winLose: "LOSE",
    info: "Teen Patti Game #7",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1067080,
    totalBetCoin: 1800,
    winnerCoin: 1600,
    winLose: "WIN",
    info: "Teen Patti Game #8",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1068880,
    totalBetCoin: 2200,
    winnerCoin: 2100,
    winLose: "WIN",
    info: "Teen Patti Game #9",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1066780,
    totalBetCoin: 2800,
    winnerCoin: 3000,
    winLose: "LOSE",
    info: "Teen Patti Game #10",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1069580,
    totalBetCoin: 3200,
    winnerCoin: 3400,
    winLose: "LOSE",
    info: "Casino Game #1",
    gameType: "casino",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1072780,
    totalBetCoin: 1800,
    winnerCoin: 1600,
    winLose: "WIN",
    info: "Casino Game #2",
    gameType: "casino",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1071180,
    totalBetCoin: 2400,
    winnerCoin: 2200,
    winLose: "WIN",
    info: "Ferry Wheel Game #1",
    gameType: "ferry-wheel",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1073580,
    totalBetCoin: 1600,
    winnerCoin: 1800,
    winLose: "LOSE",
    info: "Ferry Wheel Game #2",
    gameType: "ferry-wheel",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  },
  {
    adminCoin: 1071980,
    totalBetCoin: 2900,
    winnerCoin: 2700,
    winLose: "WIN",
    info: "Teen Patti Game #11",
    gameType: "teen-patti",
    createdAt: "2026-01-04T04:13:01 UTC+2"
  }
];

export default function GameHistoryUploader() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const uploadGameHistory = async () => {
    try {
      setUploading(true);
      setMessage('🔥 Starting game history upload...');
      
      // Upload each game history entry
      for (let i = 0; i < gameHistoryData.length; i++) {
        const history = gameHistoryData[i];
        const docId = `history_${i + 1}`;
        const docRef = doc(db, 'gameHistory', docId);
        
        // Check if document exists
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          setMessage(`📄 Game history "${history.info}" exists, updating...`);
          await setDoc(docRef, history, { merge: true });
          console.log(`✅ Game history "${history.info}" updated successfully!`);
        } else {
          setMessage(`📄 Creating new game history "${history.info}"...`);
          await setDoc(docRef, history);
          console.log(`✅ Game history "${history.info}" created successfully!`);
        }
      }
      
      setMessage('🎉 All game history uploaded successfully! You can now visit /game-history to see the data');
      toast({
        title: "Success",
        description: "Game history data uploaded successfully!",
      });
      
    } catch (error) {
      console.error('❌ Error uploading game history:', error);
      setMessage('❌ Error uploading game history: ' + error.message);
      toast({
        title: "Error",
        description: "Failed to upload game history data.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-card border-border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Game History Uploader</h1>
          <p className="text-muted-foreground mb-6">
            Upload sample game history data to Firebase Firestore
          </p>
          
          <button
            onClick={uploadGameHistory}
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Game History'}
          </button>
          
          {message && (
            <div className="mt-4 p-3 bg-muted border-border rounded text-sm text-foreground">
              {message}
            </div>
          )}
          
          <div className="mt-6 text-xs text-muted-foreground">
            <p>Game history entries to upload:</p>
            <ul className="mt-2 space-y-1">
              <li>• 10 Teen Patti games</li>
              <li>• 2 Casino games</li>
              <li>• 2 Ferry Wheel games</li>
              <li>• Total: 15 entries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
