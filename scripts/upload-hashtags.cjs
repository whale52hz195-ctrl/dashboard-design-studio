const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration for alkasser-d7701 project
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTesting",
  authDomain: "alkasser-d7701.firebaseapp.com",
  projectId: "alkasser-d7701",
  storageBucket: "alkasser-d7701.appspot.com",
  messagingSenderId: "107246385920819292580",
  appId: "1:107246385920819292580:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hashtag data matching the image
const hashtagsData = [
  {
    hashtag: '#KindHearted',
    usageCount: 12,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#Photography',
    usageCount: 11,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#JustFriends',
    usageCount: 9,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#OpenMinded',
    usageCount: 8,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#Bookworm',
    usageCount: 8,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#LongTermOnly',
    usageCount: 7,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#LookingForLove',
    usageCount: 5,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#SeriousRelationship',
    usageCount: 4,
    createdAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-23T00:00:00Z'))
  },
  {
    hashtag: '#Dating',
    usageCount: 15,
    createdAt: Timestamp.fromDate(new Date('2025-06-20T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-20T00:00:00Z'))
  },
  {
    hashtag: '#RelationshipGoals',
    usageCount: 13,
    createdAt: Timestamp.fromDate(new Date('2025-06-19T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-19T00:00:00Z'))
  },
  {
    hashtag: '#Love',
    usageCount: 25,
    createdAt: Timestamp.fromDate(new Date('2025-06-18T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-18T00:00:00Z'))
  },
  {
    hashtag: '#Single',
    usageCount: 18,
    createdAt: Timestamp.fromDate(new Date('2025-06-17T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-17T00:00:00Z'))
  },
  {
    hashtag: '#MeetNewPeople',
    usageCount: 10,
    createdAt: Timestamp.fromDate(new Date('2025-06-16T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-16T00:00:00Z'))
  },
  {
    hashtag: '#Friendship',
    usageCount: 14,
    createdAt: Timestamp.fromDate(new Date('2025-06-15T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-15T00:00:00Z'))
  },
  {
    hashtag: '#Travel',
    usageCount: 9,
    createdAt: Timestamp.fromDate(new Date('2025-06-14T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-14T00:00:00Z'))
  },
  {
    hashtag: '#Foodie',
    usageCount: 11,
    createdAt: Timestamp.fromDate(new Date('2025-06-13T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-13T00:00:00Z'))
  },
  {
    hashtag: '#Fitness',
    usageCount: 7,
    createdAt: Timestamp.fromDate(new Date('2025-06-12T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-12T00:00:00Z'))
  },
  {
    hashtag: '#Music',
    usageCount: 16,
    createdAt: Timestamp.fromDate(new Date('2025-06-11T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-11T00:00:00Z'))
  },
  {
    hashtag: '#Movies',
    usageCount: 12,
    createdAt: Timestamp.fromDate(new Date('2025-06-10T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-10T00:00:00Z'))
  },
  {
    hashtag: '#Art',
    usageCount: 8,
    createdAt: Timestamp.fromDate(new Date('2025-06-09T00:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2025-06-09T00:00:00Z'))
  }
];

async function uploadHashtags() {
  try {
    console.log('Starting to upload hashtags data...');
    
    const hashtagsCollection = collection(db, 'hashtags');
    let uploadedCount = 0;
    
    for (const hashtag of hashtagsData) {
      try {
        const docRef = await addDoc(hashtagsCollection, hashtag);
        
        console.log(`✅ Uploaded hashtag: ${hashtag.hashtag} (ID: ${docRef.id})`);
        uploadedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to upload hashtag: ${hashtag.hashtag}`, error);
      }
    }
    
    console.log(`\n🎉 Upload complete! Successfully uploaded ${uploadedCount}/${hashtagsData.length} hashtags`);
    
  } catch (error) {
    console.error('❌ Error uploading hashtags:', error);
  }
}

// Run the upload
uploadHashtags().then(() => {
  console.log('✨ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
