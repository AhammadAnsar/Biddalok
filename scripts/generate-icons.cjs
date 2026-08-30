const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function generateIcons() {
  console.log('Generating Biddalok brand icons from SVG...');
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Ensure directories exist
  const publicDir = path.join(__dirname, '../public');
  const buildDir = path.join(__dirname, '../build');
  const electronDir = path.join(__dirname, '../electron');

  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
  if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });

  // Standard Windows ICO sizes (16, 32, 48, 256). Note: 512 is ONLY for PNG, not ICO.
  const icoSizes = [256, 48, 32, 16];
  const allSizes = [16, 32, 48, 64, 128, 256, 512];
  const tempIcoPaths = [];

  for (const size of allSizes) {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: size,
      },
      shapeRendering: 2,
      textRendering: 2,
      imageRendering: 1,
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    if (size === 512) {
      fs.writeFileSync(path.join(publicDir, 'icon.png'), pngBuffer);
      fs.writeFileSync(path.join(buildDir, 'icon.png'), pngBuffer);
      fs.writeFileSync(path.join(electronDir, 'icon.png'), pngBuffer);
    }
    if (size === 256) {
      fs.writeFileSync(path.join(publicDir, 'icon-256.png'), pngBuffer);
    }

    if (icoSizes.includes(size)) {
      const tempFile = path.join(buildDir, `temp-${size}.png`);
      fs.writeFileSync(tempFile, pngBuffer);
      tempIcoPaths.push(tempFile);
    }
  }

  // Generate multi-resolution Windows .ico file strictly with compliant NSIS sizes (256, 48, 32, 16)
  try {
    const icoBuffer = await pngToIco(tempIcoPaths);
    fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuffer);
    fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
    fs.writeFileSync(path.join(electronDir, 'icon.ico'), icoBuffer);
    console.log('Windows ICO (256, 48, 32, 16) and PNG files successfully generated!');
  } catch (err) {
    console.error('Error generating ICO:', err);
  }

  // Clean up temp files
  for (const tempFile of tempIcoPaths) {
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {}
  }
}

generateIcons().catch(console.error);
