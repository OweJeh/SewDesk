// generate-icons.mjs
// Renders the SewDesk symbol on a WHITE background into PNG & SVG icons
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Read the original symbol SVG
const symbolSvg = readFileSync(join(root, 'public/icons/sewdesk-symbol.svg'), 'utf-8');

// Build an SVG with white background
function makeWhiteBgSvg(size, paddingRatio = 0.10) {
  const vbMatch = symbolSvg.match(/viewBox="([^"]+)"/);
  const vb = vbMatch ? vbMatch[1] : '0 0 330 360';
  const [vx, vy, vw, vh] = vb.split(' ').map(Number);

  const padding = size * paddingRatio;
  const inner = size - padding * 2;
  const scale = inner / Math.max(vw, vh);
  const tx = (size - vw * scale) / 2;
  const ty = (size - vh * scale) / 2;

  const innerContent = symbolSvg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    ${innerContent}
  </g>
</svg>`;
}

// 1. Generate favicon.svg (vector favicon with crisp white background)
const faviconSvg = makeWhiteBgSvg(360, 0.08);
writeFileSync(join(root, 'public/icons/favicon.svg'), faviconSvg, 'utf-8');
console.log('✓ favicon.svg (360x360 vector with white background)');

// 2. Generate PNG sizes
const configs = [
  { file: 'favicon-16x16.png',       size: 16,  pad: 0.06 },
  { file: 'favicon-32x32.png',       size: 32,  pad: 0.06 },
  { file: 'apple-touch-icon.png',    size: 180, pad: 0.10 },
  { file: 'icon-192.png',            size: 192, pad: 0.10 },
  { file: 'icon-512.png',            size: 512, pad: 0.10 },
  { file: 'icon-maskable-192.png',   size: 192, pad: 0.18 }, // Within 80% safe zone for Android
  { file: 'icon-maskable-512.png',   size: 512, pad: 0.18 }, // Within 80% safe zone for Android
];

let png32Buffer = null;

for (const { file, size, pad } of configs) {
  const svg = makeWhiteBgSvg(size, pad);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  if (file === 'favicon-32x32.png') {
    png32Buffer = pngBuffer;
  }
  const outPath = join(root, 'public/icons', file);
  writeFileSync(outPath, pngBuffer);
  console.log(`✓ ${file}  (${size}×${size}px, ${(pngBuffer.length/1024).toFixed(1)} KB)`);
}

// 3. Create favicon.ico from 32x32 PNG (valid ICO header wrapping PNG data)
if (png32Buffer) {
  // Simple valid ICO header containing a single PNG image:
  // Header: 2 bytes reserved (0), 2 bytes type (1 = icon), 2 bytes count (1)
  // Entry: 1 byte width (32), 1 byte height (32), 1 byte color palette (0), 1 byte reserved (0),
  //        2 bytes color planes (1), 2 bytes bits per pixel (32), 4 bytes size, 4 bytes offset (22)
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);       // reserved
  icoHeader.writeUInt16LE(1, 2);       // 1 = ICO
  icoHeader.writeUInt16LE(1, 4);       // 1 image
  icoHeader.writeUInt8(32, 6);         // width 32
  icoHeader.writeUInt8(32, 7);         // height 32
  icoHeader.writeUInt8(0, 8);          // no palette
  icoHeader.writeUInt8(0, 9);          // reserved
  icoHeader.writeUInt16LE(1, 10);      // color planes
  icoHeader.writeUInt16LE(32, 12);     // bpp
  icoHeader.writeUInt32LE(png32Buffer.length, 14); // image size
  icoHeader.writeUInt32LE(22, 18);     // data offset (immediately after header)

  const icoFile = Buffer.concat([icoHeader, png32Buffer]);
  writeFileSync(join(root, 'public/favicon.ico'), icoFile);
  console.log(`✓ favicon.ico  (root favicon, ${(icoFile.length/1024).toFixed(1)} KB)`);
}

console.log('\nAll white background icons generated successfully.');
