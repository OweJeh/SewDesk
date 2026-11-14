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

// Full points with control points
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

console.log('Total bezier segments in polygon:', curveSegments.length);

// Sample points along the entire polygon outline
function sampleCubicBezier(p0, p1, p2, p3, steps = 10) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x;
    const y = mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y;
    pts.push({ x, y });
  }
  return pts;
}

const allSampled = [];
curveSegments.forEach(seg => {
  allSampled.push(...sampleCubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, 20));
});

console.log('Sampled outline points count:', allSampled.length);

