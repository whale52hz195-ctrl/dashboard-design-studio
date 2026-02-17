const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfZbqJ2k8l9mN1oP3qR4sT5uV6wX7yZ8a",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Rich gift data with images, GIFs, and SVGA
const giftsData = [
  // Love Category - Images
  {
    name: "Heart",
    image: "❤️",
    category: "Love",
    price: 50,
    status: "Active",
    featured: true,
    totalSent: 12500,
    totalRevenue: 625000,
    type: "emoji"
  },
  {
    name: "Rose",
    image: "🌹",
    category: "Love",
    price: 30,
    status: "Active",
    featured: false,
    totalSent: 8900,
    totalRevenue: 267000,
    type: "emoji"
  },
  {
    name: "Love Letter",
    image: "💌",
    category: "Love",
    price: 75,
    status: "Active",
    featured: true,
    totalSent: 5600,
    totalRevenue: 420000,
    type: "emoji"
  },
  {
    name: "Cupid",
    image: "💘",
    category: "Love",
    price: 100,
    status: "Active",
    featured: false,
    totalSent: 3200,
    totalRevenue: 320000,
    type: "emoji"
  },
  {
    name: "Kiss",
    image: "💋",
    category: "Love",
    price: 40,
    status: "Active",
    featured: false,
    totalSent: 7800,
    totalRevenue: 312000,
    type: "emoji"
  },
  {
    name: "Wedding Ring",
    image: "💍",
    category: "Love",
    price: 200,
    status: "Active",
    featured: true,
    totalSent: 1500,
    totalRevenue: 300000,
    type: "emoji"
  },

  // Premium Category - High Value
  {
    name: "Diamond",
    image: "💎",
    category: "Premium",
    price: 500,
    status: "Active",
    featured: true,
    totalSent: 3400,
    totalRevenue: 1700000,
    type: "emoji"
  },
  {
    name: "Crown",
    image: "👑",
    category: "Premium",
    price: 1000,
    status: "Active",
    featured: true,
    totalSent: 1200,
    totalRevenue: 1200000,
    type: "emoji"
  },
  {
    name: "Gold Bar",
    image: "🏆",
    category: "Premium",
    price: 750,
    status: "Active",
    featured: false,
    totalSent: 800,
    totalRevenue: 600000,
    type: "emoji"
  },
  {
    name: "Private Jet",
    image: "✈️",
    category: "Premium",
    price: 2000,
    status: "Active",
    featured: true,
    totalSent: 300,
    totalRevenue: 600000,
    type: "emoji"
  },

  // Lucky Category - Fortune Items
  {
    name: "Lucky Star",
    image: "⭐",
    category: "Lucky",
    price: 100,
    status: "Active",
    featured: true,
    totalSent: 5600,
    totalRevenue: 560000,
    type: "emoji"
  },
  {
    name: "Four Leaf Clover",
    image: "🍀",
    category: "Lucky",
    price: 80,
    status: "Active",
    featured: false,
    totalSent: 4200,
    totalRevenue: 336000,
    type: "emoji"
  },
  {
    name: "Horseshoe",
    image: "🐴",
    category: "Lucky",
    price: 120,
    status: "Active",
    featured: false,
    totalSent: 2800,
    totalRevenue: 336000,
    type: "emoji"
  },
  {
    name: "Crystal Ball",
    image: "🔮",
    category: "Lucky",
    price: 150,
    status: "Active",
    featured: true,
    totalSent: 1900,
    totalRevenue: 285000,
    type: "emoji"
  },
  {
    name: "Money Tree",
    image: "🌳",
    category: "Lucky",
    price: 300,
    status: "Active",
    featured: false,
    totalSent: 900,
    totalRevenue: 270000,
    type: "emoji"
  },
  {
    name: "Lucky Cat",
    image: "🐱",
    category: "Lucky",
    price: 60,
    status: "Active",
    featured: false,
    totalSent: 6700,
    totalRevenue: 402000,
    type: "emoji"
  },

  // Heart Category - More Hearts
  {
    name: "Broken Heart",
    image: "💔",
    category: "Heart",
    price: 20,
    status: "Active",
    featured: false,
    totalSent: 4500,
    totalRevenue: 90000,
    type: "emoji"
  },
  {
    name: "Sparkling Heart",
    image: "💖",
    category: "Heart",
    price: 60,
    status: "Active",
    featured: true,
    totalSent: 3800,
    totalRevenue: 228000,
    type: "emoji"
  },
  {
    name: "Growing Heart",
    image: "💗",
    category: "Heart",
    price: 45,
    status: "Active",
    featured: false,
    totalSent: 5200,
    totalRevenue: 234000,
    type: "emoji"
  },
  {
    name: "Beating Heart",
    image: "💓",
    category: "Heart",
    price: 55,
    status: "Active",
    featured: false,
    totalSent: 4100,
    totalRevenue: 225500,
    type: "emoji"
  },

  // Emoji Category - Fun Emojis
  {
    name: "Fire",
    image: "🔥",
    category: "Emoji",
    price: 25,
    status: "Active",
    featured: false,
    totalSent: 15400,
    totalRevenue: 385000,
    type: "emoji"
  },
  {
    name: "Rocket",
    image: "🚀",
    category: "Emoji",
    price: 35,
    status: "Active",
    featured: false,
    totalSent: 8900,
    totalRevenue: 311500,
    type: "emoji"
  },
  {
    name: "Party Popper",
    image: "🎉",
    category: "Emoji",
    price: 40,
    status: "Active",
    featured: true,
    totalSent: 7600,
    totalRevenue: 304000,
    type: "emoji"
  },
  {
    name: "Confetti Ball",
    image: "🎊",
    category: "Emoji",
    price: 30,
    status: "Active",
    featured: false,
    totalSent: 9200,
    totalRevenue: 276000,
    type: "emoji"
  },
  {
    name: "Thumbs Up",
    image: "👍",
    category: "Emoji",
    price: 15,
    status: "Active",
    featured: false,
    totalSent: 18900,
    totalRevenue: 283500,
    type: "emoji"
  },
  {
    name: "Clapping Hands",
    image: "👏",
    category: "Emoji",
    price: 20,
    status: "Active",
    featured: false,
    totalSent: 12300,
    totalRevenue: 246000,
    type: "emoji"
  },
  {
    name: "Laughing",
    image: "😂",
    category: "Emoji",
    price: 25,
    status: "Active",
    featured: false,
    totalSent: 15600,
    totalRevenue: 390000,
    type: "emoji"
  },
  {
    name: "Mind Blown",
    image: "🤯",
    category: "Emoji",
    price: 45,
    status: "Active",
    featured: true,
    totalSent: 5400,
    totalRevenue: 243000,
    type: "emoji"
  },

  // Flag Category - Country Flags
  {
    name: "Rainbow Flag",
    image: "🏳️‍🌈",
    category: "Flag",
    price: 75,
    status: "Active",
    featured: true,
    totalSent: 2100,
    totalRevenue: 157500,
    type: "emoji"
  },
  {
    name: "Pirate Flag",
    image: "🏴‍☠️",
    category: "Flag",
    price: 80,
    status: "Active",
    featured: false,
    totalSent: 1800,
    totalRevenue: 144000,
    type: "emoji"
  },
  {
    name: "White Flag",
    image: "🏳️",
    category: "Flag",
    price: 25,
    status: "Active",
    featured: false,
    totalSent: 6700,
    totalRevenue: 167500,
    type: "emoji"
  },
  {
    name: "Black Flag",
    image: "🏴",
    category: "Flag",
    price: 30,
    status: "Active",
    featured: false,
    totalSent: 5400,
    totalRevenue: 162000,
    type: "emoji"
  },

  // SVGA Magic-Make Gifts - Animated Gifts
  {
    name: "Magic Sparkle",
    image: "https://example.com/svga/magic-sparkle.svga",
    category: "SVGA Magic-Make Gifts",
    price: 150,
    status: "Active",
    featured: true,
    totalSent: 3200,
    totalRevenue: 480000,
    type: "svga"
  },
  {
    name: "Golden Rain",
    image: "https://example.com/svga/golden-rain.svga",
    category: "SVGA Magic-Make Gifts",
    price: 200,
    status: "Active",
    featured: true,
    totalSent: 2400,
    totalRevenue: 480000,
    type: "svga"
  },
  {
    name: "Love Explosion",
    image: "https://example.com/svga/love-explosion.svga",
    category: "SVGA Magic-Make Gifts",
    price: 180,
    status: "Active",
    featured: false,
    totalSent: 2800,
    totalRevenue: 504000,
    type: "svga"
  },
  {
    name: "Star Shower",
    image: "https://example.com/svga/star-shower.svga",
    category: "SVGA Magic-Make Gifts",
    price: 120,
    status: "Active",
    featured: false,
    totalSent: 3600,
    totalRevenue: 432000,
    type: "svga"
  },
  {
    name: "Fireworks",
    image: "https://example.com/svga/fireworks.svga",
    category: "SVGA Magic-Make Gifts",
    price: 250,
    status: "Active",
    featured: true,
    totalSent: 1800,
    totalRevenue: 450000,
    type: "svga"
  },
  {
    name: "Heart Rain",
    image: "https://example.com/svga/heart-rain.svga",
    category: "SVGA Magic-Make Gifts",
    price: 160,
    status: "Active",
    featured: false,
    totalSent: 2900,
    totalRevenue: 464000,
    type: "svga"
  },
  {
    name: "Diamond Storm",
    image: "https://example.com/svga/diamond-storm.svga",
    category: "SVGA Magic-Make Gifts",
    price: 300,
    status: "Active",
    featured: true,
    totalSent: 1200,
    totalRevenue: 360000,
    type: "svga"
  },

  // GIF Category - Animated GIFs
  {
    name: "Dancing Heart",
    image: "https://example.com/gifs/dancing-heart.gif",
    category: "SVGA Magic-Make Gifts",
    price: 90,
    status: "Active",
    featured: false,
    totalSent: 4500,
    totalRevenue: 405000,
    type: "gif"
  },
  {
    name: "Sparkling Stars",
    image: "https://example.com/gifs/sparkling-stars.gif",
    category: "SVGA Magic-Make Gifts",
    price: 70,
    status: "Active",
    featured: false,
    totalSent: 5800,
    totalRevenue: 406000,
    type: "gif"
  },
  {
    name: "Floating Hearts",
    image: "https://example.com/gifs/floating-hearts.gif",
    category: "SVGA Magic-Make Gifts",
    price: 85,
    status: "Active",
    featured: false,
    totalSent: 4900,
    totalRevenue: 416500,
    type: "gif"
  },
  {
    name: "Rainbow Burst",
    image: "https://example.com/gifs/rainbow-burst.gif",
    category: "SVGA Magic-Make Gifts",
    price: 110,
    status: "Active",
    featured: false,
    totalSent: 3200,
    totalRevenue: 352000,
    type: "gif"
  },

  // Image Category - Static Images
  {
    name: "Rose Bouquet",
    image: "https://images.unsplash.com/photo-1518709594029-f35d07ef04c9?w=200&h=200&fit=crop",
    category: "Love",
    price: 120,
    status: "Active",
    featured: true,
    totalSent: 2100,
    totalRevenue: 252000,
    type: "image"
  },
  {
    name: "Chocolate Box",
    image: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=200&h=200&fit=crop",
    category: "Love",
    price: 80,
    status: "Active",
    featured: false,
    totalSent: 3400,
    totalRevenue: 272000,
    type: "image"
  },
  {
    name: "Teddy Bear",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=200&h=200&fit=crop",
    category: "Love",
    price: 95,
    status: "Active",
    featured: false,
    totalSent: 2800,
    totalRevenue: 266000,
    type: "image"
  },
  {
    name: "Diamond Ring",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop",
    category: "Premium",
    price: 800,
    status: "Active",
    featured: true,
    totalSent: 600,
    totalRevenue: 480000,
    type: "image"
  },
  {
    name: "Luxury Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    category: "Premium",
    price: 600,
    status: "Active",
    featured: false,
    totalSent: 900,
    totalRevenue: 540000,
    type: "image"
  },
  {
    name: "Sports Car",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=200&fit=crop",
    category: "Premium",
    price: 1500,
    status: "Active",
    featured: true,
    totalSent: 400,
    totalRevenue: 600000,
    type: "image"
  }
];

async function uploadGifts() {
  try {
    console.log('Starting to upload gifts data...');
    
    const giftsCollection = collection(db, 'gifts');
    let uploadedCount = 0;
    
    for (const gift of giftsData) {
      try {
        const docRef = await addDoc(giftsCollection, {
          ...gift,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        console.log(`✅ Uploaded gift: ${gift.name} (ID: ${docRef.id})`);
        uploadedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to upload gift: ${gift.name}`, error);
      }
    }
    
    console.log(`\n🎉 Upload complete! Successfully uploaded ${uploadedCount}/${giftsData.length} gifts`);
    
    // Summary by category
    const categorySummary = giftsData.reduce((acc, gift) => {
      acc[gift.category] = (acc[gift.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Summary by category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} gifts`);
    });
    
  } catch (error) {
    console.error('❌ Error uploading gifts:', error);
  }
}

// Run the upload
uploadGifts().then(() => {
  console.log('✨ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
