// Upload sample wealth level data to Firebase
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const sampleWealthLevels = [
  {
    benefits: [
      "Basic support",
      "Standard features",
      "Monthly bonus",
      "Access to public rooms"
    ],
    color: "#CD7F32",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 5,
    icon: "🥉",
    level: 1,
    maxCoins: 99999,
    minCoins: 0,
    minSpent: 0,
    name: "Bronze"
  },
  {
    benefits: [
      "Priority support",
      "Enhanced features",
      "Weekly bonus",
      "Access to premium rooms",
      "Special tournaments"
    ],
    color: "#C0C0C0",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 10,
    icon: "🥈",
    level: 2,
    maxCoins: 499999,
    minCoins: 100000,
    minSpent: 100,
    name: "Silver"
  },
  {
    benefits: [
      "Fast support",
      "All premium features",
      "Bi-weekly bonus",
      "VIP room access",
      "Exclusive tournaments",
      "Custom avatar"
    ],
    color: "#FFD700",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 12,
    icon: "🥇",
    level: 3,
    maxCoins: 999999,
    minCoins: 500000,
    minSpent: 500,
    name: "Gold"
  },
  {
    benefits: [
      "24/7 VIP support",
      "Platinum badge",
      "All premium features",
      "Private rooms access"
    ],
    color: "#E5E4E2",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 15,
    icon: "💎",
    level: 4,
    maxCoins: 1999999,
    minCoins: 1000000,
    minSpent: 1000,
    name: "Platinum"
  },
  {
    benefits: [
      "Dedicated account manager",
      "Royal badge",
      "Unlimited features",
      "Exclusive events",
      "Highest priority support",
      "Custom rewards"
    ],
    color: "#FF6B6B",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 20,
    icon: "👑",
    level: 5,
    maxCoins: 4999999,
    minCoins: 2000000,
    minSpent: 2500,
    name: "Royal"
  },
  {
    benefits: [
      "Personal concierge",
      "Elite badge",
      "All exclusive features",
      "Private tournaments",
      "Priority in all queues",
      "Custom game modes",
      "Revenue sharing"
    ],
    color: "#4ECDC4",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 25,
    icon: "🏆",
    level: 6,
    maxCoins: 9999999,
    minCoins: 5000000,
    minSpent: 5000,
    name: "Elite"
  },
  {
    benefits: [
      "White glove service",
      "Legendary badge",
      "Creator privileges",
      "Game development access",
      "Server priority",
      "Exclusive content creation",
      "Profit sharing program",
      "Real-world events"
    ],
    color: "#45B7D1",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 30,
    icon: "⭐",
    level: 7,
    maxCoins: 19999999,
    minCoins: 10000000,
    minSpent: 10000,
    name: "Legendary"
  },
  {
    benefits: [
      "Ultimate VIP experience",
      "Mythical badge",
      "Platform ownership perks",
      "Direct developer access",
      "Custom server options",
      "Global tournament hosting",
      "Equity opportunities",
      "Exclusive partnerships",
      "Lifetime benefits"
    ],
    color: "#9B59B6",
    createdAt: "4 January 2026 at 01:42:50 UTC+2",
    discountRate: 35,
    icon: "🌟",
    level: 8,
    maxCoins: 99999999,
    minCoins: 20000000,
    minSpent: 25000,
    name: "Mythical"
  }
];

async function uploadWealthLevels() {
  try {
    console.log('🔥 Uploading wealth level data to Firebase...');
    
    for (let i = 0; i < sampleWealthLevels.length; i++) {
      const level = sampleWealthLevels[i];
      const docId = `level_${level.level}`;
      const docRef = doc(db, 'wealthLevels', docId);
      
      await setDoc(docRef, level);
      console.log(`✅ Uploaded: ${level.name} (Level ${level.level})`);
      console.log(`   Icon: ${level.icon} | Color: ${level.color}`);
      console.log(`   Benefits: ${level.benefits.length} perks`);
      console.log(`   Range: ${level.minCoins.toLocaleString()} - ${level.maxCoins.toLocaleString()} coins`);
      console.log(`   Discount: ${level.discountRate}% | Min Spent: $${level.minSpent}`);
      console.log('');
    }
    
    console.log(`🎉 Successfully uploaded ${sampleWealthLevels.length} wealth levels!`);
    console.log('📊 Levels created:');
    console.log('  - Level 1: Bronze (0 - 99,999 coins)');
    console.log('  - Level 2: Silver (100,000 - 499,999 coins)');
    console.log('  - Level 3: Gold (500,000 - 999,999 coins)');
    console.log('  - Level 4: Platinum (1,000,000 - 1,999,999 coins)');
    console.log('  - Level 5: Royal (2,000,000 - 4,999,999 coins)');
    console.log('  - Level 6: Elite (5,000,000 - 9,999,999 coins)');
    console.log('  - Level 7: Legendary (10,000,000 - 19,999,999 coins)');
    console.log('  - Level 8: Mythical (20,000,000+ coins)');
    console.log('💰 Discount rates: 5% - 35%');
    console.log('🎯 Total benefits: 40+ exclusive perks');
    
    return true;
  } catch (error) {
    console.error('❌ Error uploading wealth levels:', error);
    return false;
  }
}

uploadWealthLevels();
