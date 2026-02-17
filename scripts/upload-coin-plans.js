// Upload sample coin plan data to Firebase
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const sampleCoinPlans = [
  {
    bonus: 0,
    coins: 88,
    color: "#FFD700",
    createdAt: "14 February 2026 at 20:43:17 UTC+2",
    currency: "USD",
    discount: 0,
    featured: false,
    icon: "🪙",
    name: "Quick Charge",
    originalPrice: 1.07,
    popular: false,
    price: 1.07,
    status: "Active",
    totalCoins: 88,
    totalRevenue: 0,
    totalSales: 0,
    updatedAt: "14 February 2026 at 20:43:17 UTC+2"
  },
  {
    bonus: 10,
    coins: 500,
    color: "#4CAF50",
    createdAt: "14 February 2026 at 20:43:17 UTC+2",
    currency: "USD",
    discount: 10,
    featured: true,
    icon: "💎",
    name: "Premium Pack",
    originalPrice: 5.99,
    popular: true,
    price: 5.39,
    status: "Active",
    totalCoins: 550,
    totalRevenue: 0,
    totalSales: 0,
    updatedAt: "14 February 2026 at 20:43:17 UTC+2"
  },
  {
    bonus: 25,
    coins: 1200,
    color: "#2196F3",
    createdAt: "14 February 2026 at 20:43:17 UTC+2",
    currency: "USD",
    discount: 15,
    featured: true,
    icon: "👑",
    name: "Mega Bundle",
    originalPrice: 14.99,
    popular: true,
    price: 12.74,
    status: "Active",
    totalCoins: 1500,
    totalRevenue: 0,
    totalSales: 0,
    updatedAt: "14 February 2026 at 20:43:17 UTC+2"
  }
];

async function uploadCoinPlans() {
  try {
    console.log('🔥 Uploading coin plans to Firebase...');
    
    for (let i = 0; i < sampleCoinPlans.length; i++) {
      const plan = sampleCoinPlans[i];
      const docId = `plan_${i}`;
      const docRef = doc(db, 'coinPlans', docId);
      
      await setDoc(docRef, plan);
      console.log(`✅ Uploaded: ${plan.name} (${plan.coins} coins)`);
    }
    
    console.log(`🎉 Successfully uploaded ${sampleCoinPlans.length} coin plans!`);
    console.log('📊 Plans include:');
    console.log('  - Quick Charge: 88 coins for $1.07');
    console.log('  - Premium Pack: 500 coins (+10 bonus) for $5.39');
    console.log('  - Mega Bundle: 1200 coins (+25 bonus) for $12.74');
    
    return true;
  } catch (error) {
    console.error('❌ Error uploading coin plans:', error);
    return false;
  }
}

uploadCoinPlans();
