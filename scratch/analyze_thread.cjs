const fs = require('fs');

// Let's parse the path commands in thread svg
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Let's find absolute coordinates of the thread path
// Main path has transform="translate(271.6015625,40.921875)"
const tx = 271.6015625;
const ty = 40.921875;

// Let's inspect the SVG in a browser canvas / node SVG parser if needed
console.log('Thread tx, ty:', tx, ty);

