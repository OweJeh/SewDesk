const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/Dev OJ/.gemini/antigravity/brain/30b956d3-7479-4ebc-8bfc-6a958fe1b359/.user_uploaded/media_1794606564872_d58c4099.png');

const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

let pos = 8;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}

zlib.inflate(Buffer.concat(idatChunks), (err, raw) => {
  if (err) throw err;
  const stride = width * 4 + 1;
  // Let's find rows with dark pixels where alpha > 128
  const darkRows = [];
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride + 1;
    let darkCount = 0;
    let minX = width, maxX = 0;
    for (let x = 0; x < width; x++) {
      const px = rowStart + x * 4;
      const r = raw[px], g = raw[px+1], b = raw[px+2], a = raw[px+3];
      if (a > 100 && (r + g + b) / 3 < 100) {
        darkCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    if (darkCount > 10) {
      darkRows.push({ y, darkCount, minX, maxX });
    }
  }

  // Find bands
  const bands = [];
  let cur = null;
  for (const r of darkRows) {
    if (!cur) cur = { start: r.y, end: r.y, minX: r.minX, maxX: r.maxX };
    else if (r.y - cur.end <= 8) {
      cur.end = r.y;
      cur.minX = Math.min(cur.minX, r.minX);
      cur.maxX = Math.max(cur.maxX, r.maxX);
    } else {
      bands.push(cur);
      cur = { start: r.y, end: r.y, minX: r.minX, maxX: r.maxX };
    }
  }
  if (cur) bands.push(cur);

  console.log('Detected Elements in Reference Image:');
  bands.forEach((b, i) => {
    console.log(`Band ${i}: y=[${b.start}, ${b.end}] (h=${b.end - b.start + 1}), x=[${b.minX}, ${b.maxX}] (w=${b.maxX - b.minX + 1})`);
  });
});

