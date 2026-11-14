const fs = require('fs');

// We have the 65 boundary points in `pts`.
// Let's compute distance to a polyline or bezier curve.
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

const pts = [];
for (const sp of subpaths) {
  if (sp.cmd === 'M') {
    pts.push({ x: tx + sp.args[0], y: ty + sp.args[1] });
  } else if (sp.cmd === 'C') {
    for (let i = 0; i < sp.args.length; i += 6) {
      pts.push({
        x: tx + sp.args[i+4],
        y: ty + sp.args[i+5]
      });
    }
  }
}

// Candidate mask guide path points:
// Start at approach: (320, 15)
// Eye: (255, 45)
// Upper loop right side: (290, 80), (285, 130), (240, 160)
// Upper loop top and left: (175, 18), (115, 60), (105, 100), (150, 155)
// Waist: (190, 165)
// Lower loop right: (280, 210), (308, 250), (290, 290)
// Lower loop bottom: (200, 325), (120, 335), (60, 315)
// Lower loop flourish: (25, 270), (35, 220), (75, 190)

console.log('Boundary points count:', pts.length);

