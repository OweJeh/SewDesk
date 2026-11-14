const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();
const threadInner = threadSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// Let's create an animated test page where we test different mask trajectories!
const html = `<!DOCTYPE html>
<html>
<head>
<title>Mask Trajectory Test</title>
<style>
  body { background: #222; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px;}
  .canvas-box { background: #fff; padding: 20px; border-radius: 12px; margin: 10px; }
  svg { display: block; }
</style>
</head>
<body>
  <h1>Thread Path Inspection & Animation Mask</h1>
  <div class="canvas-box">
    <svg width="600" height="600" viewBox="0 0 330 360">
      <defs>
        <!-- Test Mask -->
        <mask id="testMask">
          <path id="maskPath" d="" fill="none" stroke="white" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
        </mask>
      </defs>

      <!-- Full Original Design -->
      <g opacity="0.2">
        <g id="needle">${needleInner}</g>
        <g id="thread">${threadInner}</g>
      </g>
    </svg>
  </div>
</body>
</html>`;

fs.writeFileSync('public/test-mask.html', html);
console.log('Written test-mask.html');

