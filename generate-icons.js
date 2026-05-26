import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icons/icon.svg');
const iconsDir = path.resolve('public/icons');

async function generate() {
  console.log('Rendering responsive PNG view assets from SVG codebase source... ⚙️');
  
  if (!fs.existsSync(svgPath)) {
    console.error('File not found: ' + svgPath);
    process.exit(1);
  }

  try {
    // Generate 180x180 Apple touch icon with flat background mapping to prevent transparent corners from turning black on iOS
    const iosBgColor = '#FEDECC'; // Fits the outer gradient layer edge flawlessly
    
    await sharp(svgPath)
      .resize(180, 180)
      .flatten({ background: iosBgColor })
      .png()
      .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
    console.log('✅ Created public/icons/apple-touch-icon.png (180x180 flat background)');

    // Overwrite the root fallback locations to satisfy lazy Safari path queries
    await sharp(svgPath)
      .resize(180, 180)
      .flatten({ background: iosBgColor })
      .png()
      .toFile(path.resolve('public/apple-touch-icon.png'));
    console.log('✅ Created public/apple-touch-icon.png (Root fallback)');

    await sharp(svgPath)
      .resize(180, 180)
      .flatten({ background: iosBgColor })
      .png()
      .toFile(path.resolve('public/apple-touch-icon-precomposed.png'));
    console.log('✅ Created public/apple-touch-icon-precomposed.png (Root precomposed fallback)');

    // Generate 192x192 manifest icon
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(iconsDir, 'icon-192.png'));
    console.log('✅ Created icon-192.png (192x192 for general OS device installations)');

    // Generate 512x512 manifest icon
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(iconsDir, 'icon-512.png'));
    console.log('✅ Created icon-512.png (512x512 for splash screens and high-DPI displays)');

    console.log('🚀 PWA assets generation finished successfully!');
  } catch (err) {
    console.error('❌ Failed to render PNG assets:', err);
    process.exit(1);
  }
}

generate();
