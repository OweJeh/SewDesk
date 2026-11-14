const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = match[2];
const ty = match[3];

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

const html = `<!DOCTYPE html>
<html>
<head>
<title>Compare Tracing Approaches</title>
<style>
  body { background: #0f1115; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 30px; display: flex; flex-direction: column; align-items: center; }
  .grid { display: flex; gap: 30px; flex-wrap: wrap; justify-content: center; }
  .card { background: #ffffff; color: #111; padding: 24px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 340px; }
  h3 { margin: 0 0 10px 0; font-size: 15px; text-align: center; color: #111; }
  p { font-size: 11px; color: #666; margin: 0 0 15px 0; text-align: center; }
  svg { border: 1px dashed #ddd; background: #fff; width: 220px; height: 240px; }
  .btn { margin-top: 20px; padding: 10px 24px; font-size: 14px; font-weight: 600; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
</style>
</head>
<body>
  <h1>SewDesk S-Thread Tracing Comparison</h1>
  <div class="grid">
    <!-- Approach 1: Exact Vector Contour Trace -->
    <div class="card">
      <h3>Approach 1: Exact Vector Path Trace</h3>
      <p>Traces the exact vector path d from user's thread svg with stroke-dashoffset, then fills in on settle. 100% exact, sharp, zero distortion.</p>
      <svg viewBox="0 0 330 360" fill="none">
        <g id="needle-1">${needleInner}</g>
        <path id="path1" d="${d}" transform="translate(${tx}, ${ty})" fill="transparent" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- Approach 2: Centerline Stitch into Exact Vector -->
    <div class="card">
      <h3>Approach 2: Single Centerline Stitch to Vector</h3>
      <p>Draws a single needle stitch through upper loop and lower flourish, then tightens into the user's exact calligraphic vector.</p>
      <svg viewBox="0 0 330 360" fill="none">
        <g id="needle-2">${needleInner}</g>
        <path id="path2-stroke" d="M 255 48 C 240 28, 205 18, 172 20 C 125 22, 108 55, 114 96 C 118 135, 150 155, 205 160 C 250 172, 295 208, 305 245 C 312 282, 285 315, 235 328 C 160 338, 95 330, 48 300 C 22 275, 22 235, 42 208 C 52 195, 68 188, 80 188" fill="none" stroke="#000" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
        <path id="path2-exact" d="${d}" transform="translate(${tx}, ${ty})" fill="#000" opacity="0" />
      </svg>
    </div>

    <!-- Approach 3: Exact Vector Masked Sweep -->
    <div class="card">
      <h3>Approach 3: Exact Vector Masked Sweep</h3>
      <p>Reveals the exact user thread polygon with a linear-gradient clip path / mask moving from eye down the S-curve.</p>
      <svg viewBox="0 0 330 360" fill="none">
        <defs>
          <clipPath id="clip3">
            <rect id="clipRect" x="0" y="0" width="330" height="0" />
          </clipPath>
        </defs>
        <g id="needle-3">${needleInner}</g>
        <g clip-path="url(#clip3)">
          <path d="${d}" transform="translate(${tx}, ${ty})" fill="#000" />
        </g>
      </svg>
    </div>
  </div>

  <button class="btn" onclick="playAll()">Replay All Tracing Modes</button>

  <script>
    const p1 = document.getElementById('path1');
    const len1 = p1.getTotalLength();
    p1.style.strokeDasharray = len1;
    p1.style.strokeDashoffset = len1;

    const p2 = document.getElementById('path2-stroke');
    const len2 = p2.getTotalLength();
    p2.style.strokeDasharray = len2;
    p2.style.strokeDashoffset = len2;
    const p2Exact = document.getElementById('path2-exact');

    const clipRect = document.getElementById('clipRect');

    function playAll() {
      // Reset 1
      p1.style.transition = 'none';
      p1.style.strokeDashoffset = len1;
      p1.style.fill = 'transparent';

      // Reset 2
      p2.style.transition = 'none';
      p2.style.strokeDashoffset = len2;
      p2.style.opacity = '1';
      p2Exact.style.transition = 'none';
      p2Exact.style.opacity = '0';

      // Reset 3
      clipRect.style.transition = 'none';
      clipRect.setAttribute('height', '0');

      setTimeout(() => {
        // Play 1: Tracing exact path d
        p1.style.transition = 'stroke-dashoffset 2.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        p1.style.strokeDashoffset = '0';

        // Play 2: Single stitch
        p2.style.transition = 'stroke-dashoffset 2.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        p2.style.strokeDashoffset = '0';

        // Play 3: Clip rect
        clipRect.style.transition = 'height 2.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        clipRect.setAttribute('height', '360');
      }, 50);

      // Settle 1
      setTimeout(() => {
        p1.style.transition = 'fill 0.3s ease-out';
        p1.style.fill = '#000000';
      }, 1950);

      // Settle 2
      setTimeout(() => {
        p2Exact.style.transition = 'opacity 0.3s ease-out';
        p2Exact.style.opacity = '1';
        p2.style.transition = 'opacity 0.3s ease-out';
        p2.style.opacity = '0';
      }, 1950);
    }

    window.onload = playAll;
  </script>
</body>
</html>`;

fs.writeFileSync('scratch/compare_traces.html', html);
console.log('Saved scratch/compare_traces.html');

