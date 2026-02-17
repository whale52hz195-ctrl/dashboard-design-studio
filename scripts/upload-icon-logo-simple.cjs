const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Firebase configuration - using the same config from your app
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
    
    // Compress image using sharp
    console.log('Compressing image...');
    await sharp(inputPath)
      .jpeg({ quality: 70, progressive: true, optimiseScans: true })
      .toFile(outputPath);
    
    // Get compressed file size
    const compressedStats = fs.statSync(outputPath);
    console.log(`Compressed file size: ${(compressedStats.size / 1024).toFixed(2)} KB`);
    console.log(`Compression ratio: ${((1 - compressedStats.size / originalStats.size) * 100).toFixed(1)}%`);
    
    // Read compressed image
    const imageBuffer = fs.readFileSync(outputPath);
    
    // Create reference in Firebase Storage
    const storageRef = ref(storage, 'icons/IconLogo.jpeg');
    
    // Upload to Firebase Storage
    console.log('Uploading to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, imageBuffer, {
      contentType: 'image/jpeg',
      metadata: {
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
        customMetadata: {
          'originalSize': `${originalStats.size}`,
          'compressedSize': `${compressedStats.size}`,
          'compressionRatio': `${((1 - compressedStats.size / originalStats.size) * 100).toFixed(1)}%`
        }
      }
    });
    
    console.log('Upload completed successfully');
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    // Clean up compressed file
    fs.unlinkSync(outputPath);
    console.log('Temporary compressed file removed');
    
    return downloadURL;
    
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
  .then((url) => {
    console.log('\n✅ Image uploaded successfully!');
    console.log('📎 Download URL:', url);
    console.log('📁 Storage path: icons/IconLogo.jpeg');
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\n💡 Tip: Make sure Firebase Storage rules allow public uploads or authenticate first');
    }
    
    process.exit(1);
  });
