const fs = require('fs');

// We have grid from rasterize_thread.cjs
const width = 330;
const height = 360;

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
      curveSegments.push({
        p0: { x: curX, y: curY },
        p1: { x: tx + sp.args[i], y: ty + sp.args[i+1] },
        p2: { x: tx + sp.args[i+2], y: ty + sp.args[i+3] },
        p3: { x: tx + sp.args[i+4], y: ty + sp.args[i+5] }
      });
      curX = tx + sp.args[i+4];
      curY = ty + sp.args[i+5];
    }
  }
}

function sampleCubicBezier(p0, p1, p2, p3, steps = 15) {
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

const polyline = [];
curveSegments.forEach(seg => {
  polyline.push(...sampleCubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, 10));
});

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const insidePixels = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (pointInPoly(x + 0.5, y + 0.5, polyline)) {
      insidePixels.push({ x: x + 0.5, y: y + 0.5 });
    }
  }
}

console.log('Inside pixels count:', insidePixels.length);

// Sample Candidate Paths
function parsePathToSegments(pathStr) {
  const regex = /([MC])([^MC]*)/g;
  const segs = [];
  let cur = { x: 0, y: 0 };
  let m;
  while ((m = regex.exec(pathStr)) !== null) {
    const type = m[1];
    const nums = m[2].trim().split(/[\s,]+/).map(Number);
    if (type === 'M') {
      cur = { x: nums[0], y: nums[1] };
    } else if (type === 'C') {
      for (let i = 0; i < nums.length; i += 6) {
        segs.push({
          p0: { ...cur },
          p1: { x: nums[i], y: nums[i+1] },
          p2: { x: nums[i+2], y: nums[i+3] },
          p3: { x: nums[i+4], y: nums[i+5] }
        });
        cur = { x: nums[i+4], y: nums[i+5] };
      }
    }
  }
  const pts = [];
  segs.forEach(s => pts.push(...sampleCubicBezier(s.p0, s.p1, s.p2, s.p3, 30)));
  return pts;
}

const upperPts = parsePathToSegments("M 255 48 C 240 28, 205 18, 172 20 C 125 22, 108 55, 114 96 C 118 135, 150 155, 205 160 C 242 155, 280 125, 290 92 C 295 65, 280 46, 255 48");
const lowerPts = parsePathToSegments("M 205 160 C 250 172, 295 208, 305 245 C 312 282, 285 315, 235 328 C 160 338, 95 330, 48 300 C 22 275, 22 235, 42 208 C 52 195, 68 188, 80 188");
const allCenterPts = [...upperPts, ...lowerPts];

// Compute max distance from any inside pixel to allCenterPts
let maxDist = 0;
let uncoveredCountAt12 = 0;
let uncoveredCountAt16 = 0;
let uncoveredCountAt20 = 0;

for (let i = 0; i < insidePixels.length; i++) {
  const px = insidePixels[i].x;
  const py = insidePixels[i].y;
  let minD = Infinity;
  for (let j = 0; j < allCenterPts.length; j++) {
    const d = Math.hypot(px - allCenterPts[j].x, py - allCenterPts[j].y);
    if (d < minD) {
      minD = d;
      if (minD < 3) break; // early exit
    }
  }
  if (minD > maxDist) maxDist = minD;
  if (minD > 6) uncoveredCountAt12++;
  if (minD > 8) uncoveredCountAt16++;
  if (minD > 10) uncoveredCountAt20++;
}

console.log('Max distance from any thread pixel to centerline:', maxDist.toFixed(2));
console.log('Uncovered pixels at strokeWidth=12 (r=6):', uncoveredCountAt12, `(${(uncoveredCountAt12/insidePixels.length*100).toFixed(1)}%)`);
console.log('Uncovered pixels at strokeWidth=16 (r=8):', uncoveredCountAt16, `(${(uncoveredCountAt16/insidePixels.length*100).toFixed(1)}%)`);
console.log('Uncovered pixels at strokeWidth=20 (r=10):', uncoveredCountAt20, `(${(uncoveredCountAt20/insidePixels.length*100).toFixed(1)}%)`);

