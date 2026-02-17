import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

// Game data to upload with exact document IDs
const gamesData = [
  {
    id: "game_0",
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
    id: "game_1",
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

export default function GameDataUploader() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const uploadGames = async () => {
    try {
      setUploading(true);
      setMessage('🔥 Starting game upload...');
      
      // Upload each game with exact document ID
      for (const game of gamesData) {
        const docRef = doc(db, 'games', game.id);
        
        // Check if game exists
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          setMessage(`📄 Game "${game.name}" exists at /games/${game.id}, updating...`);
          await setDoc(docRef, game, { merge: true });
          console.log(`✅ Game "${game.name}" updated successfully at /games/${game.id}!`);
        } else {
          setMessage(`📄 Creating new game "${game.name}" at /games/${game.id}...`);
          await setDoc(docRef, game);
          console.log(`✅ Game "${game.name}" created successfully at /games/${game.id}!`);
        }
      }
      
      setMessage('🎉 All games uploaded successfully! You can now visit /game-list to see the games');
      
    } catch (error) {
      console.error('❌ Error uploading games:', error);
      setMessage('❌ Error uploading games: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-card border-border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Game Data Uploader</h1>
          <p className="text-muted-foreground mb-6">
            Upload the initial game data to Firebase Firestore
          </p>
          
          <button
            onClick={uploadGames}
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Game Data'}
          </button>
          
          {message && (
            <div className="mt-4 p-3 bg-muted border-border rounded text-sm text-foreground">
              {message}
            </div>
          )}
          
          <div className="mt-6 text-xs text-muted-foreground">
            <p>Games to upload:</p>
            <ul className="mt-2 space-y-1">
              {gamesData.map(game => (
                <li key={game.name}>• {game.name} ({game.icon})</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
