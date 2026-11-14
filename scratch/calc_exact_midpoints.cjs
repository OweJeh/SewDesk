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

// Sample forward edge (0 to 33)
const forwardPts = [];
for (let i = 0; i <= 33; i++) {
  forwardPts.push(...sampleCubicBezier(curveSegments[i].p0, curveSegments[i].p1, curveSegments[i].p2, curveSegments[i].p3, 20));
}

// Sample return edge (34 to 63) - in reverse so it goes from tip back to start
const returnPts = [];
for (let i = curveSegments.length - 1; i >= 34; i--) {
  const seg = curveSegments[i];
  // reverse the bezier sampling
  returnPts.push(...sampleCubicBezier(seg.p3, seg.p2, seg.p1, seg.p0, 20));
}

console.log('Forward pts count:', forwardPts.length);
console.log('Return pts count:', returnPts.length);

// Let's compute cumulative arc length for forward and return
function getCumulativeLengths(pts) {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x;
    const dy = pts[i].y - pts[i-1].y;
    lens.push(lens[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  return lens;
}

const fLens = getCumulativeLengths(forwardPts);
const rLens = getCumulativeLengths(returnPts);
const totalFLen = fLens[fLens.length - 1];
const totalRLen = rLens[rLens.length - 1];

console.log('Forward total length:', totalFLen.toFixed(1));
console.log('Return total length:', totalRLen.toFixed(1));

// Sample N points uniformly by normalized arc length
const N = 120;
const centerPts = [];
const widths = [];

function getPointAtFraction(pts, lens, totalLen, frac) {
  const targetDist = frac * totalLen;
  let low = 0, high = lens.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (lens[mid] < targetDist) low = mid + 1;
    else high = mid;
  }
  const idx = Math.max(1, low);
  const segLen = lens[idx] - lens[idx-1];
  const t = segLen > 0 ? (targetDist - lens[idx-1]) / segLen : 0;
  return {
    x: pts[idx-1].x + t * (pts[idx].x - pts[idx-1].x),
    y: pts[idx-1].y + t * (pts[idx].y - pts[idx-1].y)
  };
}

for (let i = 0; i <= N; i++) {
  const frac = i / N;
  const pF = getPointAtFraction(forwardPts, fLens, totalFLen, frac);
  const pR = getPointAtFraction(returnPts, rLens, totalRLen, frac);
  const mx = (pF.x + pR.x) / 2;
  const my = (pF.y + pR.y) / 2;
  const w = Math.hypot(pF.x - pR.x, pF.y - pR.y);
  centerPts.push({ x: mx, y: my });
  widths.push(w);
}

console.log('Centerline start:', centerPts[0], 'width:', widths[0].toFixed(1));
console.log('Centerline middle:', centerPts[Math.floor(N/2)], 'width:', widths[Math.floor(N/2)].toFixed(1));
console.log('Centerline end:', centerPts[N], 'width:', widths[N].toFixed(1));

// Check max and min width
const maxW = Math.max(...widths);
const minW = Math.min(...widths);
const avgW = widths.reduce((a, b) => a + b) / widths.length;
console.log(`Widths: min=${minW.toFixed(2)}, max=${maxW.toFixed(2)}, avg=${avgW.toFixed(2)}`);

