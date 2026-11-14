const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Parse all <path> elements
const paths = [];
const regex = /<path\s+d="([^"]+)"\s+fill="([^"]+)"(?:\s+transform="([^"]+)")?/g;
let m;
while ((m = regex.exec(threadSvg)) !== null) {
  paths.push({ d: m[1], fill: m[2], transform: m[3] });
}

console.log('Total paths in thread svg:', paths.length);
paths.forEach((p, i) => {
  console.log(`Path ${i}: fill=${p.fill}, transform=${p.transform}, d_len=${p.d.length}`);
});

