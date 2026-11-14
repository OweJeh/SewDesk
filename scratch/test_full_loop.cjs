const fs = require('fs');

const candidatePath = "M 255 48 C 230 25, 175 18, 140 35 C 112 55, 102 90, 114 115 C 128 142, 165 158, 205 160 C 245 155, 282 125, 292 90 C 298 62, 280 45, 255 48 C 235 90, 210 140, 205 160 C 255 175, 295 210, 305 245 C 312 280, 285 315, 235 328 C 160 338, 95 330, 48 300 C 22 275, 22 235, 42 208 C 52 195, 68 188, 80 188";

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

const html = `<!DOCTYPE html>
<html>
<head>
<title>Full Loop Test</title>
<style>
  body { background: #111; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px;}
  .box { background: #fff; padding: 20px; border-radius: 12px; margin: 10px; }
</style>
</head>
<body>
  <h2>Comparison: Full Loop Trajectory (Red) vs Official SVG (Black)</h2>
  <div class="box">
    <svg width="660" height="720" viewBox="0 0 330 360">
      <!-- Needle -->
      <g opacity="0.3">${needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}</g>
      <!-- Thread Official SVG -->
      <g fill="#000" opacity="0.35">${threadSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}</g>
      <!-- Candidate Trajectory -->
      <path d="${candidatePath}" fill="none" stroke="#e11d48" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</body>
</html>`;

fs.writeFileSync('scratch/full_loop_test.html', html);
console.log('Saved scratch/full_loop_test.html');

