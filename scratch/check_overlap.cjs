const fs = require('fs');

// Let's check overlap between needle and thread
// In scratch/rasterize_thread.cjs we had inside pixels for thread.
// Let's check where needle overlaps with thread!
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Let's inspect the two cases in compare_layering.html
// We can check pixel differences or see how they look
console.log('Inspecting overlap...');

