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

async function uploadCompressedImage() {
  try {
    console.log('Starting image compression and upload...');
    
    const inputPath = path.join(__dirname, '../src/storage/IconLogo.jpeg');
    const outputPath = path.join(__dirname, '../src/storage/IconLogo_compressed.jpeg');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    // Compress image using sharp
    console.log('Compressing image...');
    await sharp(inputPath)
      .jpeg({ quality: 80, progressive: true })
      .toFile(outputPath);
    
    console.log('Image compressed successfully');
    
    // Read compressed image
    const imageBuffer = fs.readFileSync(outputPath);
    
    // Create reference in Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file('icons/IconLogo.jpeg');
    
    // Upload to Firebase Storage
    console.log('Uploading to Firebase Storage...');
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      }
    });
    
    console.log('Upload completed successfully');
    
    // Make file public
    await file.makePublic();
    
    // Get download URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/icons/IconLogo.jpeg`;
    console.log('Download URL:', downloadURL);
    
    // Clean up compressed file
    fs.unlinkSync(outputPath);
    console.log('Temporary compressed file removed');
    
    return downloadURL;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Run the upload
uploadCompressedImage()
  .then((url) => {
    console.log('\n✅ Image uploaded successfully!');
    console.log('📎 Download URL:', url);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  });
