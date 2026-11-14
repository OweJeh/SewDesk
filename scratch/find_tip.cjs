const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = parseFloat(match[2]);
const ty = parseFloat(match[3]);

const cmdRegex = /([MCZ])([^MCZ]*)/g;
let m;
const subpaths = [];
while ((m = cmdRegex.exec(d)) !== null) {
  const cmd = m[1];
  const args = m[2].trim().split(/\s+/).filter(Boolean).map(Number);
  subpaths.push({ cmd, args });
}

const curveSegments = [];
let curX = tx, curY = ty;

for (const sp of subpaths) {
  if (sp.cmd === 'M') {
    curX = tx + sp.args[0];
    curY = ty + sp.args[1];
  } else if (sp.cmd === 'C') {
    for (let i = 0; i < sp.args.length; i += 6) {
      const p0 = { x: curX, y: curY };
      const p1 = { x: tx + sp.args[i], y: ty + sp.args[i+1] };
      const p2 = { x: tx + sp.args[i+2], y: ty + sp.args[i+3] };
      const p3 = { x: tx + sp.args[i+4], y: ty + sp.args[i+5] };
      curveSegments.push({ p0, p1, p2, p3 });
      curX = p3.x;
      curY = p3.y;
    }
  }
}

// Find minX point (the flourish tip)
let minX = Infinity;
let minXIdx = -1;
curveSegments.forEach((seg, i) => {
  if (seg.p3.x < minX) {
    minX = seg.p3.x;
    minXIdx = i;
  }
});

console.log(`Tip of flourish is at segment ${minXIdx} with x=${minX.toFixed(2)}, y=${curveSegments[minXIdx].p3.y.toFixed(2)}`);
console.log('Total segments:', curveSegments.length);

