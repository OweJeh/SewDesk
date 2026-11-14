const fs = require('fs');

const buf = fs.readFileSync('C:/Users/Dev OJ/.gemini/antigravity/brain/30b956d3-7479-4ebc-8bfc-6a958fe1b359/.user_uploaded/media_1794606564872_d58c4099.png');

// PNG dimensions are at offset 16 (width 4 bytes, height 4 bytes BE)
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('Image dimensions:', width, 'x', height);

