const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

// Let's create an SVG that shows each segment in thread svg with a different color!
// This will allow us to see EXACTLY what each segment is doing.

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
const segSvgs = [];

for (const sp of subpaths) {
  if (sp.cmd === 'M') {
    curX = tx + sp.args[0];
    curY = ty + sp.args[1];
  } else if (sp.cmd === 'C') {
    for (let i = 0; i < sp.args.length; i += 6) {
      const cp1x = tx + sp.args[i];
      const cp1y = ty + sp.args[i+1];
      const cp2x = tx + sp.args[i+2];
      const cp2y = ty + sp.args[i+3];
      const endX = tx + sp.args[i+4];
      const endY = ty + sp.args[i+5];
      
      const hue = Math.round((segIndex / 64) * 360);
      segSvgs.push(`<path d="M ${curX} ${curY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}" stroke="hsl(${hue}, 100%, 50%)" stroke-width="4" fill="none" />`);
      segSvgs.push(`<circle cx="${curX}" cy="${curY}" r="2" fill="hsl(${hue}, 100%, 50%)"><title>Seg ${segIndex}: (${curX.toFixed(1)}, ${curY.toFixed(1)})</title></circle>`);
      
      curX = endX;
      curY = endY;
      segIndex++;
    }
  }
}

const html = `<!DOCTYPE html>
<html>
<body>
  <h2>Thread Segments Colored by Index (0 = Red, 16 = Yellow, 32 = Green, 48 = Blue, 64 = Violet)</h2>
  <svg width="660" height="720" viewBox="0 0 330 360" style="background:#111;">
    <g opacity="0.3">${needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}</g>
    ${segSvgs.join('\n')}
  </svg>
</body>
</html>`;

fs.writeFileSync('scratch/colored_segments.html', html);
console.log('Saved scratch/colored_segments.html');

