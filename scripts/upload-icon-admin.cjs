const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'alkasser-d7701.appspot.com'
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // App already initialized, skip
  } else {
    throw error;
  }
}

const storage = admin.storage();
const bucket = storage.bucket('alkasser-d7701.firebasestorage.app');

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
    
    // Compress image using sharp with high compression
    console.log('Compressing image...');
    await sharp(inputPath)
      .jpeg({ 
        quality: 50, 
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
    
    // Create reference in Firebase Storage
    const file = bucket.file('images/IconLogo.jpeg');
    
    // Upload to Firebase Storage
    console.log('Uploading to Firebase Storage (gs://alkasser-d7701.firebasestorage.app/images/IconLogo.jpeg)...');
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
        metadata: {
          'originalSize': `${originalStats.size}`,
          'compressedSize': `${compressedStats.size}`,
          'compressionRatio': `${((1 - compressedStats.size / originalStats.size) * 100).toFixed(1)}%`,
          'uploadDate': new Date().toISOString()
        }
      }
    });
    
    console.log('Upload completed successfully');
    
    // Make file public
    await file.makePublic();
    
    // Get URLs
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/images/IconLogo.jpeg`;
    const gsURL = `gs://alkasser-d7701.firebasestorage.app/images/IconLogo.jpeg`;
    
    console.log('Download URL:', downloadURL);
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
    console.log('🔗 Public access: Enabled');
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  });
