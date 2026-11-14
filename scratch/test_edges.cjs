const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = parseFloat(match[2]);
const ty = parseFloat(match[3]);

// Let's analyze the 65 points of the polygon
// In scratch/print_all_pts.cjs, we saw that:
// Points 0 to 33 form the "forward" edge of the thread.
// Points 34 to 64 form the "backward" edge of the thread!
// Let's verify this!
// If Point 0 is at (271.6, 40.9) and Point 64 is at (271.6, 40.9),
// then the polygon starts at (271.6, 40.9), travels all the way to Point 34 (22.8, 262.8),
// and returns all the way back to (271.6, 40.9)!
console.log('Testing forward and backward edges...');

