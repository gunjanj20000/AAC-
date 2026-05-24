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
    // Generate 180x180 Apple touch icon
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
    console.log('✅ Created apple-touch-icon.png (180x180 for iPad and iPhone Home Screens)');

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
