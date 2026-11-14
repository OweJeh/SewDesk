const fs = require('fs');

// We have thread svg.svg
// Let's create an offscreen rasterizer or sample the polygon to find the exact skeleton / centerline!
// We can use a 330 x 360 grid!
const width = 330;
const height = 360;

// Let's check if we can rasterize the SVG polygon to a 330x360 binary grid using point-in-polygon!
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

// Convert curve segments to polyline
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

console.log('Polyline vertices count:', polyline.length);

// Ray-casting point in polygon
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

// Rasterize binary grid 330 x 360
const grid = new Uint8Array(width * height);
let insideCount = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (pointInPoly(x + 0.5, y + 0.5, polyline)) {
      grid[y * width + x] = 1;
      insideCount++;
    }
  }
}
console.log('Total pixels inside thread polygon:', insideCount);

