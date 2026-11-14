const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = match[2];
const ty = match[3];

const html = `<!DOCTYPE html>
<html>
<head>
<title>Direct SVG Path Tracing Test</title>
<style>
  body { background: #111; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 30px; }
  .box { background: #fff; padding: 30px; border-radius: 16px; margin: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .btn { padding: 10px 20px; font-size: 16px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
</style>
</head>
<body>
  <h1>Exact SVG Path Tracing (Zero Distortion, 100% Exact)</h1>
  <div class="box">
    <svg width="400" height="440" viewBox="0 0 330 360" fill="none">
      <!-- Needle -->
      <g id="needle">
        ${needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}
      </g>
      <!-- Thread Traced Directly -->
      <path id="tracePath"
        d="${d}"
        transform="translate(${tx}, ${ty})"
        fill="transparent"
        stroke="#000"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
  <button class="btn" onclick="play()">Play Trace Animation</button>

  <script>
    const p = document.getElementById('tracePath');
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;

    function play() {
      p.style.transition = 'none';
      p.style.strokeDashoffset = len;
      p.style.fill = 'transparent';
      p.style.strokeWidth = '1.8';

      setTimeout(() => {
        p.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        p.style.strokeDashoffset = '0';
      }, 50);

      setTimeout(() => {
        p.style.transition = 'fill 0.4s ease-out, stroke-width 0.4s ease-out';
        p.style.fill = '#000000';
      }, 2100);
    }

    window.onload = play;
  </script>
</body>
</html>`;

fs.writeFileSync('scratch/test_outline_trace.html', html);
console.log('Saved scratch/test_outline_trace.html');

