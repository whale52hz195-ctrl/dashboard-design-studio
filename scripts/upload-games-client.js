// Client-side game data upload script
// Run this script in the browser console when logged into the dashboard

// Import Firebase functions (they should be available in the dashboard)
const { collection, doc, setDoc, getDoc } = window.firebase || {};

// Game data to upload
const games = [
  {
    createdAt: "4 January 2026 at 04:13:01 UTC+2",
    description: "Spin to win prizes",
    featured: true,
    icon: "🎰",
    maxBet: 1000,
    minBet: 10,
    name: "Lucky Wheel",
    status: "Active",
    totalBets: 1234567,
    totalPlays: 45670,
    totalWins: 567890,
    type: "luck",
    gameLink: "",
    minWinPercent: 10,
    maxWinPercent: 95
  },
  {
    createdAt: "4 January 2026 at 04:13:01 UTC+2",
    description: "Roll the dice",
    featured: false,
    icon: "🎲",
    maxBet: 500,
    minBet: 5,
    name: "Dice Roll",
    status: "Active",
    totalBets: 890000,
    totalPlays: 34560,
    totalWins: 445000,
    type: "luck",
    gameLink: "",
    minWinPercent: 5,
    maxWinPercent: 90
  }
];

async function uploadGamesToFirebase() {
  try {
    console.log('🔥 Starting game upload...');
    
    // Get Firebase db from the imported module
    const db = window.firebase?.firestore?.getFirestore();
    if (!db) {
      console.error('❌ Firebase not available. Make sure you are logged into the dashboard.');
      return;
    }
    
    // Upload each game
    for (const game of gamesData) {
      const gameId = game.name.toLowerCase().replace(/\s+/g, '_');
      const docRef = doc(db, 'games', gameId);
      
      // Check if game exists
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        console.log(`📄 Game "${game.name}" exists, updating...`);
        await setDoc(docRef, game, { merge: true });
        console.log(`✅ Game "${game.name}" updated successfully!`);
      } else {
        console.log(`📄 Creating new game "${game.name}"...`);
        await setDoc(docRef, game);
        console.log(`✅ Game "${game.name}" created successfully!`);
      }
    }
    
    console.log('🎉 All games uploaded successfully!');
    console.log('📊 You can now visit http://localhost:8081/game-list to see the games');
    
  } catch (error) {
    console.error('❌ Error uploading games:', error);
  }
}

// Auto-run the upload
uploadGamesToFirebase();
