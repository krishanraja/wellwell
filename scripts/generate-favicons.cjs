/**
 * Generate Favicon Set from Source Image
 * 
 * Creates all required favicon sizes for different platforms:
 * - favicon-16x16.png: Browser tab favicon
 * - favicon-32x32.png: Browser tab favicon @2x
 * - apple-touch-icon.png: iOS home screen (180x180)
 * - favicon-192.png: Android/PWA icon
 * - favicon-512.png: PWA splash/manifest
 * - og-image.png: Social sharing image (1200x630)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_FILE = path.join(__dirname, '../public/favicon.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
];

async function generateFavicons() {
  console.log('🎨 Generating favicons from:', SOURCE_FILE);
  
  // Check source exists
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('❌ Source file not found:', SOURCE_FILE);
    process.exit(1);
  }

  // Generate each size
  for (const { name, size } of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);
    await sharp(SOURCE_FILE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated: ${name} (${size}x${size})`);
  }

  // Generate OG image (centered icon on dark background)
  const ogWidth = 1200;
  const ogHeight = 630;
  const iconSize = 300;
  
  // Create dark background with centered icon
  const resizedIcon = await sharp(SOURCE_FILE)
    .resize(iconSize, iconSize, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 4,
      background: { r: 13, g: 15, b: 20, alpha: 1 } // Dark background #0D0F14
    }
  })
    .composite([{
      input: resizedIcon,
      top: Math.floor((ogHeight - iconSize) / 2),
      left: Math.floor((ogWidth - iconSize) / 2)
    }])
    .png()
    .toFile(path.join(OUTPUT_DIR, 'og-image.png'));
  console.log(`✅ Generated: og-image.png (${ogWidth}x${ogHeight})`);

  console.log('\n🎉 All favicons generated successfully!');
}

generateFavicons().catch(err => {
  console.error('❌ Error generating favicons:', err);
  process.exit(1);
});
