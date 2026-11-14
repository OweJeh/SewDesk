const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = parseFloat(match[2]);
const ty = parseFloat(match[3]);

// Let's parse all sub-points in d:
// Regex to get each command
const cmdRegex = /([MCZ])([^MCZ]*)/g;
let m;
const subpaths = [];
while ((m = cmdRegex.exec(d)) !== null) {
  const cmd = m[1];
  const args = m[2].trim().split(/\s+/).filter(Boolean).map(Number);
  subpaths.push({ cmd, args });
}

// Convert all curve points to absolute (x, y)
const absolutePoints = [];
for (const sp of subpaths) {
  if (sp.cmd === 'M') {
    absolutePoints.push({ x: tx + sp.args[0], y: ty + sp.args[1] });
  } else if (sp.cmd === 'C') {
    for (let i = 0; i < sp.args.length; i += 6) {
      absolutePoints.push({
        cp1x: tx + sp.args[i],
        cp1y: tx + sp.args[i+1],
        cp2x: tx + sp.args[i+2],
        cp2y: ty + sp.args[i+3],
        x: tx + sp.args[i+4],
        y: ty + sp.args[i+5]
      });
    }
  }
}

console.log('Absolute points count:', absolutePoints.length);
absolutePoints.forEach((p, idx) => {
  if (idx % 4 === 0 || idx === absolutePoints.length - 1) {
    console.log(`Point ${idx}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
  }
});

