const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = parseFloat(match[2]);
const ty = parseFloat(match[3]);

console.log('Main thread d length:', d.length);
console.log('tx:', tx, 'ty:', ty);

// Let's check the commands:
// M0 0 C0.79 0.69 1.58 1.37 2.4 2.08 ...
// What is at (tx + 0, ty + 0)? It is (271.6, 40.9).
// In needle svg:
// where is the needle eye?
// Outer eye is between x = 239 and x = 267, y = 31 and y = 70.
// So (271.6, 40.9) is near the upper right of the needle eye!

