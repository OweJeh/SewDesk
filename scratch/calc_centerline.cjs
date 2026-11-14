const fs = require('fs');

// Let's inspect the thread SVG path points
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Let's find all points along the thread path
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = parseFloat(match[2]);
const ty = parseFloat(match[3]);

// We know the thread polygon has 66 curve segments forming a closed loop.
// Let's inspect the two edges of the loop.
// Edge 1 goes from start to middle.
// Edge 2 goes from middle back to start.
// If we find the midpoint between corresponding points on Edge 1 and Edge 2,
// that gives the exact mathematical centerline!

const nums = d.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
console.log('Total numbers in main thread d:', nums.length);

