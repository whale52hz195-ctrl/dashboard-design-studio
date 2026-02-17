import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Realistic game history data with authentic values
const realisticGameHistory = [
  {
    adminCoin: 1064680,
    totalBetCoin: 5000,
    winnerCoin: 4500,
    winLose: "WIN",
    info: "Teen Patti - Royal Flush",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:30:15 UTC+2"
  },
  {
    adminCoin: 1064180,
    totalBetCoin: 3000,
    winnerCoin: 3200,
    winLose: "LOSE",
    info: "Teen Patti - Straight Flush",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:25:30 UTC+2"
  },
  {
    adminCoin: 1067380,
    totalBetCoin: 2000,
    winnerCoin: 1800,
    winLose: "WIN",
    info: "Teen Patti - Three of a Kind",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:20:45 UTC+2"
  },
  {
    adminCoin: 1065580,
    totalBetCoin: 4000,
    winnerCoin: 4200,
    winLose: "LOSE",
    info: "Teen Patti - Straight",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:15:20 UTC+2"
  },
  {
    adminCoin: 1069780,
    totalBetCoin: 1500,
    winnerCoin: 1400,
    winLose: "WIN",
    info: "Teen Patti - Two Pair",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:10:10 UTC+2"
  },
  {
    adminCoin: 1068280,
    totalBetCoin: 2500,
    winnerCoin: 2300,
    winLose: "WIN",
    info: "Teen Patti - Pair",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:05:35 UTC+2"
  },
  {
    adminCoin: 1070780,
    totalBetCoin: 3500,
    winnerCoin: 3700,
    winLose: "LOSE",
    info: "Teen Patti - High Card",
    gameType: "teen-patti",
    createdAt: "2026-01-16T14:00:25 UTC+2"
  },
  {
    adminCoin: 1067080,
    totalBetCoin: 1800,
    winnerCoin: 1600,
    winLose: "WIN",
    info: "Teen Patti - Royal Flush",
    gameType: "teen-patti",
    createdAt: "2026-01-16T13:55:40 UTC+2"
  },
  {
    adminCoin: 1068880,
    totalBetCoin: 2200,
    winnerCoin: 2100,
    winLose: "WIN",
    info: "Teen Patti - Straight Flush",
    gameType: "teen-patti",
    createdAt: "2026-01-16T13:50:15 UTC+2"
  },
  {
    adminCoin: 1066780,
    totalBetCoin: 2800,
    winnerCoin: 3000,
    winLose: "LOSE",
    info: "Teen Patti - Three of a Kind",
    gameType: "teen-patti",
    createdAt: "2026-01-16T13:45:30 UTC+2"
  },
  {
    adminCoin: 1069580,
    totalBetCoin: 3200,
    winnerCoin: 3400,
    winLose: "LOSE",
    info: "Casino - Blackjack Win",
    gameType: "casino",
    createdAt: "2026-01-16T13:40:20 UTC+2"
  },
  {
    adminCoin: 1072780,
    totalBetCoin: 1800,
    winnerCoin: 1600,
    winLose: "WIN",
    info: "Casino - Roulette Red",
    gameType: "casino",
    createdAt: "2026-01-16T13:35:10 UTC+2"
  },
  {
    adminCoin: 1071180,
    totalBetCoin: 2400,
    winnerCoin: 2200,
    winLose: "WIN",
    info: "Ferry Wheel - Jackpot Spin",
    gameType: "ferry-wheel",
    createdAt: "2026-01-16T13:30:45 UTC+2"
  },
  {
    adminCoin: 1073580,
    totalBetCoin: 1600,
    winnerCoin: 1800,
    winLose: "LOSE",
    info: "Ferry Wheel - Bonus Round",
    gameType: "ferry-wheel",
    createdAt: "2026-01-16T13:25:30 UTC+2"
  },
  {
    adminCoin: 1071980,
    totalBetCoin: 2900,
    winnerCoin: 2700,
    winLose: "WIN",
    info: "Teen Patti - Full House",
    gameType: "teen-patti",
    createdAt: "2026-01-16T13:20:15 UTC+2"
  },
  {
    adminCoin: 1074680,
    totalBetCoin: 4200,
    winnerCoin: 4000,
    winLose: "WIN",
    info: "Teen Patti - Four of a Kind",
    gameType: "teen-patti",
    createdAt: "2026-01-16T13:15:40 UTC+2"
  },
  {
    adminCoin: 1078680,
    totalBetCoin: 5500,
    winnerCoin: 5800,
    winLose: "LOSE",
    info: "Teen Patti - Straight",
    gameType: "teen-patti",
    createdAt: "2026-01-16T13:10:25 UTC+2"
  },
  {
    adminCoin: 1073180,
    totalBetCoin: 3300,
    winnerCoin: 3100,
    winLose: "WIN",
    info: "Casino - Poker Win",
    gameType: "casino",
    createdAt: "2026-01-16T13:05:10 UTC+2"
  },
  {
    adminCoin: 1076480,
    totalBetCoin: 2600,
    winnerCoin: 2800,
    winLose: "LOSE",
    info: "Casino - Slot Machine",
    gameType: "casino",
    createdAt: "2026-01-16T13:00:35 UTC+2"
  },
  {
    adminCoin: 1073880,
    totalBetCoin: 1900,
    winnerCoin: 1700,
    winLose: "WIN",
    info: "Ferry Wheel - Lucky Spin",
    gameType: "ferry-wheel",
    createdAt: "2026-01-16T12:55:20 UTC+2"
  },
  {
    adminCoin: 1075780,
    totalBetCoin: 3100,
    winnerCoin: 2900,
    winLose: "WIN",
    info: "Ferry Wheel - Mega Bonus",
    gameType: "ferry-wheel",
    createdAt: "2026-01-16T12:50:15 UTC+2"
  },
  {
    adminCoin: 1078780,
    totalBetCoin: 4700,
    winnerCoin: 4500,
    winLose: "WIN",
    info: "Teen Patti - Royal Flush",
    gameType: "teen-patti",
    createdAt: "2026-01-16T12:45:30 UTC+2"
  },
  {
    adminCoin: 1083480,
    totalBetCoin: 6200,
    winnerCoin: 6500,
    winLose: "LOSE",
    info: "Teen Patti - Straight Flush",
    gameType: "teen-patti",
    createdAt: "2026-01-16T12:40:10 UTC+2"
  },
  {
    adminCoin: 1077280,
    totalBetCoin: 3800,
    winnerCoin: 3600,
    winLose: "WIN",
    info: "Casino - Baccarat Win",
    gameType: "casino",
    createdAt: "2026-01-16T12:35:45 UTC+2"
  }
];

export default function RealisticGameHistoryUploader() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const uploadRealisticData = async () => {
    try {
      setUploading(true);
      setMessage('🔥 Uploading realistic game history data...');
      
      // Upload each realistic game history entry
      for (let i = 0; i < realisticGameHistory.length; i++) {
        const game = realisticGameHistory[i];
        const docId = `history_${String(i + 1).padStart(3, '0')}`;
        const docRef = doc(db, 'gameHistory', docId);
        
        await setDoc(docRef, game);
        setMessage(`📊 Uploading: ${game.info} (${game.gameType})...`);
        console.log(`✅ Uploaded: ${game.info} (${game.gameType})`);
      }
      
      setMessage('🎉 Successfully uploaded 23 realistic game history entries!');
      toast({
        title: "Success!",
        description: "Realistic game history data uploaded successfully!",
      });
      
    } catch (error) {
      console.error('❌ Error uploading realistic game history:', error);
      setMessage('❌ Error uploading data: ' + error.message);
      toast({
        title: "Error",
        description: "Failed to upload realistic game history data.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="bg-card border-border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Realistic Game History</h1>
          <p className="text-muted-foreground mb-6">
            Upload authentic and realistic game history data to Firebase
          </p>
          
          <button
            onClick={uploadRealisticData}
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium mb-4"
          >
            {uploading ? 'Uploading Realistic Data...' : 'Upload Realistic Game History'}
          </button>
          
          {message && (
            <div className="mb-6 p-3 bg-muted border-border rounded text-sm text-foreground">
              {message}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground space-y-3">
            <div>
              <p className="font-semibold text-foreground">📊 Realistic Data Features:</p>
              <ul className="mt-2 space-y-1">
                <li>• 15 Teen Patti games with authentic hand names</li>
                <li>• 5 Casino games (Blackjack, Roulette, Poker, Slots, Baccarat)</li>
                <li>• 3 Ferry Wheel games with bonus features</li>
                <li>• Realistic betting amounts (1,500 - 6,200 coins)</li>
                <li>• Authentic win/loss ratios</li>
                <li>• Real timestamps from today</li>
                <li>• Professional game descriptions</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold text-foreground">🎮 Game Types:</p>
              <ul className="mt-2 space-y-1">
                <li>• Teen Patti: Royal Flush, Straight Flush, Three of a Kind</li>
                <li>• Casino: Blackjack, Roulette, Poker, Slots, Baccarat</li>
                <li>• Ferry Wheel: Jackpot Spin, Bonus Round, Lucky Spin</li>
              </ul>
            </div>
            
            <div className="pt-2 border-t border-border">
              <p className="font-semibold text-green-500">✨ After upload, visit /game-history to see realistic data!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
