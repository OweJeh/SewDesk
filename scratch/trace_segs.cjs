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

let curX = tx, curY = ty;
let segIndex = 0;

for (const sp of subpaths) {
  if (sp.cmd === 'M') {
    curX = tx + sp.args[0];
    curY = ty + sp.args[1];
    console.log(`Start at: (${curX.toFixed(1)}, ${curY.toFixed(1)})`);
  } else if (sp.cmd === 'C') {
    for (let i = 0; i < sp.args.length; i += 6) {
      const endX = tx + sp.args[i+4];
      const endY = ty + sp.args[i+5];
      console.log(`Seg ${segIndex++}: from (${curX.toFixed(1)}, ${curY.toFixed(1)}) to (${endX.toFixed(1)}, ${endY.toFixed(1)})`);
      curX = endX;
      curY = endY;
    }
  }
}

