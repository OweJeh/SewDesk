const fs = require('fs');

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

const needleInner = needle.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();
const threadInner = thread.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// Guide path for the mask:
// 1. Approaches needle eye from upper right
// 2. Passes through needle eye opening (around 255, 45)
// 3. Draws upper loop around (crest at 175, 16, down left side to 115, 88, then to waist 185, 150)
// 4. Draws lower loop (right belly 308, 240, bottom 180, 328, sweeps up left crescent to 30, 220)
const maskPath = "M 320 15 C 295 25, 275 35, 255 45 C 245 25, 215 15, 175 16 C 125 17, 108 52, 115 88 C 122 124, 155 146, 185 150 C 225 155, 265 170, 292 200 C 315 228, 312 265, 280 295 C 245 325, 170 330, 110 320 C 50 310, 22 265, 30 220 C 35 185, 65 165, 100 155";

const html = `<!DOCTYPE html>
<html>
<head>
<title>SewDesk Mask Animation Test</title>
<style>
  body {
    background: #111;
    color: #eee;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
  }
  .box {
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  svg {
    border: 1px dashed #ddd;
    background: #fff;
  }
  .btn {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
  }
</style>
</head>
<body>
  <h1>SewDesk Thread Drawing Verification</h1>
  <div class="box">
    <svg width="400" height="400" viewBox="0 0 330 360" fill="none">
      <defs>
        <mask id="threadMask">
          <path id="animStroke" d="${maskPath}" fill="none" stroke="white" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" />
        </mask>
      </defs>

      <!-- Needle -->
      <g id="needle-layer">
        ${needleInner}
      </g>

      <!-- Thread with Mask -->
      <g id="thread-layer" mask="url(#threadMask)">
        ${threadInner}
      </g>

      <!-- Guide Stroke Debug Overlay (can toggle) -->
      <path id="guideOverlay" d="${maskPath}" fill="none" stroke="red" stroke-width="2" opacity="0.4" />
    </svg>

    <button class="btn" onclick="playAnim()">Play Animation</button>
  </div>

  <script>
    const path = document.getElementById('animStroke');
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    function playAnim() {
      path.style.transition = 'none';
      path.style.strokeDashoffset = len;
      setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(0.35, 0.05, 0.15, 1.0)';
        path.style.strokeDashoffset = '0';
      }, 50);
    }
    window.onload = playAnim;
  </script>
</body>
</html>`;

fs.writeFileSync('public/test-mask-anim.html', html);
console.log('Saved public/test-mask-anim.html');

