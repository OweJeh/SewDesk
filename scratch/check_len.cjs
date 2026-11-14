const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];

// In scratch/compute_exact_centerline.cjs we computed:
// Total length was ~ 2173.9 units!
console.log('Approximate path length of thread polygon:', 2174);

