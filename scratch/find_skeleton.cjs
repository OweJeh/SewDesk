const fs = require('fs');

const width = 330;
const height = 360;

// Load polyline from rasterize_thread.cjs logic
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

const grid = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (pointInPoly(x + 0.5, y + 0.5, polyline)) {
      grid[y * width + x] = 1;
    }
  }
}

// Compute Euclidean Distance Transform (distance to boundary)
const dist = new Float32Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (grid[y * width + x] === 0) {
      dist[y * width + x] = 0;
      continue;
    }
    // Find min dist to polyline boundary
    let minDistSq = Infinity;
    for (let i = 0; i < polyline.length; i++) {
      const dx = (x + 0.5) - polyline[i].x;
      const dy = (y + 0.5) - polyline[i].y;
      const dSq = dx*dx + dy*dy;
      if (dSq < minDistSq) minDistSq = dSq;
    }
    dist[y * width + x] = Math.sqrt(minDistSq);
  }
}

// Find local maxima of distance transform (the ridge / skeleton)
const skeletonPts = [];
for (let y = 2; y < height - 2; y++) {
  for (let x = 2; x < width - 2; x++) {
    const dVal = dist[y * width + x];
    if (dVal < 1.5) continue;
    
    // Check if it's a ridge point in some direction
    const dL = dist[y * width + (x - 1)];
    const dR = dist[y * width + (x + 1)];
    const dU = dist[(y - 1) * width + x];
    const dD = dist[(y + 1) * width + x];
    const dUL = dist[(y - 1) * width + (x - 1)];
    const dDR = dist[(y + 1) * width + (x + 1)];
    const dUR = dist[(y - 1) * width + (x + 1)];
    const dDL = dist[(y + 1) * width + (x - 1)];

    const isRidgeH = dVal >= dL && dVal >= dR;
    const isRidgeV = dVal >= dU && dVal >= dD;
    const isRidgeD1 = dVal >= dUL && dVal >= dDR;
    const isRidgeD2 = dVal >= dUR && dVal >= dDL;

    if (isRidgeH || isRidgeV || isRidgeD1 || isRidgeD2) {
      skeletonPts.push({ x: x + 0.5, y: y + 0.5, r: dVal });
    }
  }
}

console.log('Skeleton points count:', skeletonPts.length);

// Let's output an HTML page with these skeleton points visualized over the SVG!
const circles = skeletonPts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1" fill="cyan" />`).join('\n');

const html = `<!DOCTYPE html>
<html>
<body>
  <svg width="660" height="720" viewBox="0 0 330 360" style="background:#111;">
    <g fill="#444">
      <path d="${d}" transform="translate(${tx}, ${ty})" />
    </g>
    ${circles}
  </svg>
</body>
</html>`;

fs.writeFileSync('scratch/skeleton_view.html', html);
console.log('Saved scratch/skeleton_view.html');

