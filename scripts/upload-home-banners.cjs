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

// Home banner data matching the exact structure
const homeBannersData = [
  {
    title: 'Welcome Banner',
    imageUrl: 'https://via.placeholder.com/1920x1080/4CAF50/FFFFFF?text=Welcome',
    linkTo: '/dashboard',
    linkType: 'internal',
    status: 'Active',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-04T04:13:01+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-02-03T04:13:01+02:00')),
    order: 1,
    views: 12340,
    clicks: 890,
    clickRate: 7.2,
    createdAt: Timestamp.fromDate(new Date('2026-01-04T04:13:01+02:00'))
  },
  {
    title: 'New Features',
    imageUrl: 'https://picsum.photos/seed/newfeatures/1920x1080.jpg',
    linkTo: 'https://example.com/features',
    linkType: 'external',
    status: 'Active',
    type: 'banner',
    startDate: Timestamp.fromDate(new Date('2026-01-10T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-02-10T00:00:00+02:00')),
    order: 2,
    views: 8560,
    clicks: 425,
    clickRate: 4.96,
    createdAt: Timestamp.fromDate(new Date('2026-01-10T00:00:00+02:00'))
  },
  {
    title: 'Special Offer',
    imageUrl: 'https://picsum.photos/seed/specialoffer/1920x1080.jpg',
    linkTo: '/store',
    linkType: 'internal',
    status: 'Active',
    type: 'popup',
    startDate: Timestamp.fromDate(new Date('2026-01-15T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-01-25T00:00:00+02:00')),
    order: 3,
    views: 5430,
    clicks: 876,
    clickRate: 16.13,
    createdAt: Timestamp.fromDate(new Date('2026-01-15T00:00:00+02:00'))
  },
  {
    title: 'Maintenance Notice',
    imageUrl: 'https://picsum.photos/seed/maintenance/1920x1080.jpg',
    linkTo: '/status',
    linkType: 'internal',
    status: 'Inactive',
    type: 'splash',
    startDate: Timestamp.fromDate(new Date('2026-01-20T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-01-21T00:00:00+02:00')),
    order: 4,
    views: 2340,
    clicks: 123,
    clickRate: 5.26,
    createdAt: Timestamp.fromDate(new Date('2026-01-20T00:00:00+02:00'))
  },
  {
    title: 'Holiday Special',
    imageUrl: 'https://picsum.photos/seed/holiday/1920x1080.jpg',
    linkTo: 'https://example.com/holiday',
    linkType: 'external',
    status: 'Active',
    type: 'banner',
    startDate: Timestamp.fromDate(new Date('2026-01-25T00:00:00+02:00')),
    endDate: Timestamp.fromDate(new Date('2026-02-05T00:00:00+02:00')),
    order: 5,
    views: 15670,
    clicks: 2340,
    clickRate: 14.93,
    createdAt: Timestamp.fromDate(new Date('2026-01-25T00:00:00+02:00'))
  }
];

async function uploadHomeBanners() {
  try {
    console.log('Starting to upload home banners data...');
    
    const bannersCollection = collection(db, 'banners');
    let uploadedCount = 0;
    
    for (const banner of homeBannersData) {
      try {
        const docRef = await addDoc(bannersCollection, banner);
        
        console.log(`✅ Uploaded banner: ${banner.title} (ID: ${docRef.id})`);
        uploadedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to upload banner: ${banner.title}`, error);
      }
    }
    
    console.log(`\n🎉 Upload complete! Successfully uploaded ${uploadedCount}/${homeBannersData.length} home banners`);
    
  } catch (error) {
    console.error('❌ Error uploading home banners:', error);
  }
}

// Run the upload
uploadHomeBanners().then(() => {
  console.log('✨ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
