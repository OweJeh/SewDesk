const fs = require('fs');

// We have the candidate path:
// Let's sample points along candidatePath and test against skeleton points or polyline
const candidatePath = "M 255 48 C 230 25, 175 18, 140 35 C 112 55, 102 90, 114 115 C 128 142, 165 158, 205 160 C 245 155, 282 125, 292 90 C 298 62, 280 45, 255 48 C 235 90, 210 140, 205 160 C 255 175, 295 210, 305 245 C 312 280, 285 315, 235 328 C 160 338, 95 330, 48 300 C 22 275, 22 235, 42 208 C 52 195, 68 188, 80 188";

// Let's parse commands
const regex = /([MC])([^MC]*)/g;
let m;
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

console.log('Total bezier segments in candidate path:', segs.length);

function sampleSeg(seg, n = 30) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const x = mt*mt*mt*seg.p0.x + 3*mt*mt*t*seg.p1.x + 3*mt*t*t*seg.p2.x + t*t*t*seg.p3.x;
    const y = mt*mt*mt*seg.p0.y + 3*mt*mt*t*seg.p1.y + 3*mt*t*t*seg.p2.y + t*t*t*seg.p3.y;
    pts.push({ x, y });
  }
  return pts;
}

const sampled = [];
segs.forEach(s => sampled.push(...sampleSeg(s)));
console.log('Sampled candidate points:', sampled.length);

