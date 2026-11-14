const fs = require('fs');
const zlib = require('zlib');

// Read PNG and parse IDAT
const buf = fs.readFileSync('C:/Users/Dev OJ/.gemini/antigravity/brain/30b956d3-7479-4ebc-8bfc-6a958fe1b359/.user_uploaded/media_1794606564872_d58c4099.png');

// Width and height
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

// Extract IDAT chunks
let pos = 8;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') {
    idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const compressed = Buffer.concat(idatChunks);
zlib.inflate(compressed, (err, uncompressed) => {
  if (err) {
    console.error(err);
    return;
  }
  
  // Scan vertical black/dark pixels
  // uncompressed has (width * 4 + 1) * height or (width * 3 + 1) * height
  const bpp = (uncompressed.length / height - 1) / width;
  console.log('Bytes per pixel:', bpp);

  // Find y ranges of dark pixels
  const rowHasDark = [];
  const stride = width * bpp + 1;
  for (let y = 0; y < height; y++) {
    let darkCount = 0;
    const rowOffset = y * stride + 1;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * bpp;
      const r = uncompressed[idx];
      const g = uncompressed[idx + 1];
      const b = uncompressed[idx + 2];
      // Dark pixel
      if (r < 100 && g < 100 && b < 100) {
        darkCount++;
      }
    }
    if (darkCount > 5) {
      rowHasDark.push({ y, darkCount });
    }
  }

  console.log('Total rows with dark pixels:', rowHasDark.length);
  if (rowHasDark.length > 0) {
    console.log('First dark row y:', rowHasDark[0].y);
    console.log('Last dark row y:', rowHasDark[rowHasDark.length - 1].y);
  }

  // Find gaps in dark rows
  const bands = [];
  let currentBand = null;
  for (let i = 0; i < rowHasDark.length; i++) {
    const r = rowHasDark[i];
    if (!currentBand) {
      currentBand = { start: r.y, end: r.y, count: 1 };
    } else if (r.y === currentBand.end + 1 || r.y === currentBand.end + 2) {
      currentBand.end = r.y;
      currentBand.count++;
    } else {
      bands.push(currentBand);
      currentBand = { start: r.y, end: r.y, count: 1 };
    }
  }
  if (currentBand) bands.push(currentBand);

  console.log('Detected vertical bands:');
  bands.forEach((b, i) => console.log(`Band ${i}: y=${b.start} to ${b.end} (height=${b.end - b.start + 1})`));
});

