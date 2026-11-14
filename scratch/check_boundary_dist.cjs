const fs = require('fs');

// We have the polyline from rasterize_thread.cjs
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

function distToPolyline(px, py) {
  let minD = Infinity;
  for (let i = 0; i < polyline.length; i++) {
    const d = Math.hypot(px - polyline[i].x, py - polyline[i].y);
    if (d < minD) minD = d;
  }
  return minD;
}

// Let's test the candidate path
const candidatePath = "M 255 48 C 230 25, 175 18, 140 35 C 112 55, 102 90, 114 115 C 128 142, 165 158, 205 160 C 245 155, 282 125, 292 90 C 298 62, 280 45, 255 48 C 235 90, 210 140, 205 160 C 255 175, 295 210, 305 245 C 312 280, 285 315, 235 328 C 160 338, 95 330, 48 300 C 22 275, 22 235, 42 208 C 52 195, 68 188, 80 188";

const regex = /([MC])([^MC]*)/g;
const segs = [];
let cur = { x: 0, y: 0 };
while ((m = regex.exec(candidatePath)) !== null) {
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

// Check distances to boundary
// If the candidate path is well-centered inside the thread,
// the distance to boundary should be between 3px and 8px everywhere!
const sampledPts = [];
segs.forEach(s => sampledPts.push(...sampleCubicBezier(s.p0, s.p1, s.p2, s.p3, 20)));

const dists = sampledPts.map(p => distToPolyline(p.x, p.y));
console.log('Distances from candidate to boundary:');
console.log('Min:', Math.min(...dists).toFixed(2));
console.log('Max:', Math.max(...dists).toFixed(2));
console.log('Avg:', (dists.reduce((a, b) => a + b) / dists.length).toFixed(2));

