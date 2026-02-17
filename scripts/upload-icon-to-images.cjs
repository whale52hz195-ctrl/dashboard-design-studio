const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Firebase configuration
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
const storage = getStorage(app);

async function uploadCompressedImage() {
  try {
    console.log('Starting image compression and upload...');
    
    const inputPath = path.join(__dirname, '../src/storage/IconLogo.jpeg');
    const outputPath = path.join(__dirname, '../src/storage/IconLogo_compressed.jpeg');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    // Get original file size
    const originalStats = fs.statSync(inputPath);
    console.log(`Original file size: ${(originalStats.size / 1024).toFixed(2)} KB`);
    
    // Compress image using sharp with higher compression
    console.log('Compressing image...');
    await sharp(inputPath)
      .jpeg({ 
        quality: 60, 
        progressive: true, 
        optimiseScans: true,
        mozjpeg: true
      })
      .toFile(outputPath);
    
    // Get compressed file size
    const compressedStats = fs.statSync(outputPath);
    console.log(`Compressed file size: ${(compressedStats.size / 1024).toFixed(2)} KB`);
    console.log(`Compression ratio: ${((1 - compressedStats.size / originalStats.size) * 100).toFixed(1)}%`);
    
    // Read compressed image
    const imageBuffer = fs.readFileSync(outputPath);
    
    // Create reference in Firebase Storage - upload to images directory
    const storageRef = ref(storage, 'images/IconLogo.jpeg');
    
    // Upload to Firebase Storage
    console.log('Uploading to Firebase Storage (gs://alkasser-d7701.firebasestorage.app/images/IconLogo.jpeg)...');
    const snapshot = await uploadBytes(storageRef, imageBuffer, {
      contentType: 'image/jpeg',
      metadata: {
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
        customMetadata: {
          'originalSize': `${originalStats.size}`,
          'compressedSize': `${compressedStats.size}`,
          'compressionRatio': `${((1 - compressedStats.size / originalStats.size) * 100).toFixed(1)}%`,
          'uploadDate': new Date().toISOString()
        }
      }
    });
    
    console.log('Upload completed successfully');
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    // Also show the GS URL
    const gsURL = `gs://alkasser-d7701.firebasestorage.app/images/IconLogo.jpeg`;
    console.log('GS URL:', gsURL);
    
    // Clean up compressed file
    fs.unlinkSync(outputPath);
    console.log('Temporary compressed file removed');
    
    return { downloadURL, gsURL };
    
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Clean up compressed file if it exists
    const outputPath = path.join(__dirname, '../src/storage/IconLogo_compressed.jpeg');
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    throw error;
  }
}

// Run the upload
uploadCompressedImage()
  .then(({ downloadURL, gsURL }) => {
    console.log('\n✅ Image uploaded successfully!');
    console.log('📎 Download URL:', downloadURL);
    console.log('📁 GS URL:', gsURL);
    console.log('📂 Storage path: images/IconLogo.jpeg');
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\n💡 Tip: Authentication required. Make sure you are logged in to Firebase.');
    }
    
    process.exit(1);
  });
