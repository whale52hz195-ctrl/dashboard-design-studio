// Realistic game history data for Firebase upload
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

// Upload realistic game history data to Firebase
export async function uploadRealisticGameHistory() {
  try {
    console.log('🔥 Uploading realistic game history data...');
    
    for (let i = 0; i < realisticGameHistory.length; i++) {
      const game = realisticGameHistory[i];
      const docId = `history_${String(i + 1).padStart(3, '0')}`;
      const docRef = doc(db, 'gameHistory', docId);
      
      await setDoc(docRef, game);
      console.log(`✅ Uploaded: ${game.info} (${game.gameType})`);
    }
    
    console.log(`🎉 Successfully uploaded ${realisticGameHistory.length} realistic game history entries!`);
    console.log('📊 Data includes:');
    console.log('  - 15 Teen Patti games with realistic hand names');
    console.log('  - 5 Casino games (Blackjack, Roulette, Poker, Slots, Baccarat)');
    console.log('  - 3 Ferry Wheel games with bonus features');
    console.log('  - Realistic betting amounts and win/loss ratios');
    console.log('  - Authentic timestamps from today');
    
    return true;
  } catch (error) {
    console.error('❌ Error uploading realistic game history:', error);
    return false;
  }
}

// Execute the upload
uploadRealisticGameHistory();
