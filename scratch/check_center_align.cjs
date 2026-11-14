const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();
const threadInner = threadSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// Candidate Centerline Path for Upper Loop + Waist + Lower Loop
// Let's trace it with precise cubic beziers!
// Part 1: Upper loop starting at needle eye (255, 48)
// Curves up to crest (175, 22)
// Curves down left to (115, 95)
// Curves towards waist (185, 155)
// Curves across waist to lower loop
// Curves right belly (298, 245)
// Curves bottom base (175, 330)
// Sweeps flourish (30, 255) to (70, 192)

const centerPath = "M 255 48 C 242 28, 215 20, 175 22 C 128 24, 112 58, 114 96 C 117 132, 145 152, 185 155 C 225 158, 265 178, 292 212 C 312 238, 308 272, 280 302 C 248 328, 180 334, 115 326 C 55 318, 24 285, 30 250 C 35 218, 62 195, 78 190";

const html = `<!DOCTYPE html>
<html>
<head>
<title>Centerline Alignment Check</title>
<style>
  body { background: #18191c; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px; }
  .box { background: #fff; padding: 30px; border-radius: 16px; margin: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  svg { display: block; }
</style>
</head>
<body>
  <h1>Thread Centerline Verification</h1>
  <div class="box">
    <svg width="660" height="720" viewBox="0 0 330 360">
      <!-- Needle -->
      <g opacity="0.3">${needleInner}</g>
      <!-- User's Official Thread -->
      <g opacity="0.4" fill="#000">${threadInner}</g>
      <!-- Centerline Path in Red -->
      <path d="${centerPath}" fill="none" stroke="#e11d48" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</body>
</html>`;

fs.writeFileSync('scratch/centerline_align.html', html);
console.log('Saved scratch/centerline_align.html');

