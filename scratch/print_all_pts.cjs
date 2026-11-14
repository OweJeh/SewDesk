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

const pts = [];
for (const sp of subpaths) {
  if (sp.cmd === 'M') {
    pts.push({ cmd: 'M', x: tx + sp.args[0], y: ty + sp.args[1] });
  } else if (sp.cmd === 'C') {
    for (let i = 0; i < sp.args.length; i += 6) {
      pts.push({
        cmd: 'C',
        x: tx + sp.args[i+4],
        y: ty + sp.args[i+5]
      });
    }
  }
}

pts.forEach((p, i) => {
  console.log(`${i.toString().padStart(2, ' ')}: x=${p.x.toFixed(1)}, y=${p.y.toFixed(1)}`);
});

