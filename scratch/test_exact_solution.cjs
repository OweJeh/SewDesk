const fs = require('fs');

const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const threadD = match[1];
const threadTx = match[2];
const threadTy = match[3];

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

const html = `<!DOCTYPE html>
<html>
<head>
<title>SewDesk Official Motion Test</title>
<style>
  body {
    background: #000;
    color: #fff;
    font-family: 'Inter', -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
  }
  .stage {
    display: flex;
    gap: 40px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .screen {
    background: #ffffff;
    width: 320px;
    height: 380px;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .screen.dark {
    background: #000000;
    border: 1px solid #333;
  }
  .controls {
    margin-top: 30px;
  }
  .btn {
    background: #fff;
    color: #000;
    font-weight: 600;
    padding: 10px 24px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }
</style>
</head>
<body>
  <div class="stage">
    <!-- Light Mode -->
    <div class="screen" id="screenLight">
      <div style="width: 72px; height: 80px; position: relative;">
        <svg viewBox="0 0 330 360" fill="none" style="width: 100%; height: 100%; overflow: visible;">
          <!-- Thread Layer -->
          <path id="threadLight"
            d="${threadD}"
            transform="translate(${threadTx}, ${threadTy})"
            fill="transparent"
            stroke="#000000"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Needle Layer -->
          <g id="needleLight" style="transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out;">
            ${needleInner}
          </g>
        </svg>
      </div>

      <div id="textLight" style="text-align: center; margin-top: 10px; opacity: 0; transform: translateY(10px); transition: opacity 0.6s ease-out, transform 0.6s ease-out;">
        <div style="font-weight: 800; font-size: 22px; color: #000; letter-spacing: -0.02em;">SewDesk</div>
        <div style="font-weight: 600; font-size: 7.5px; color: #777; letter-spacing: 0.28em; text-transform: uppercase; margin-top: 4px;">MEASURE. MANAGE. CREATE.</div>
      </div>
    </div>

    <!-- Dark Mode -->
    <div class="screen dark" id="screenDark">
      <div style="width: 72px; height: 80px; position: relative;">
        <svg viewBox="0 0 330 360" fill="none" style="width: 100%; height: 100%; overflow: visible;">
          <!-- Thread Layer -->
          <path id="threadDark"
            d="${threadD}"
            transform="translate(${threadTx}, ${threadTy})"
            fill="transparent"
            stroke="#FFFFFF"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Needle Layer -->
          <g id="needleDark" style="filter: invert(1); transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out;">
            ${needleInner}
          </g>
        </svg>
      </div>

      <div id="textDark" style="text-align: center; margin-top: 10px; opacity: 0; transform: translateY(10px); transition: opacity 0.6s ease-out, transform 0.6s ease-out;">
        <div style="font-weight: 800; font-size: 22px; color: #FFF; letter-spacing: -0.02em;">SewDesk</div>
        <div style="font-weight: 600; font-size: 7.5px; color: #888; letter-spacing: 0.28em; text-transform: uppercase; margin-top: 4px;">MEASURE. MANAGE. CREATE.</div>
      </div>
    </div>
  </div>

  <div class="controls">
    <button class="btn" onclick="play()">Replay Choreography</button>
  </div>

  <script>
    const tl = document.getElementById('threadLight');
    const td = document.getElementById('threadDark');
    const nl = document.getElementById('needleLight');
    const nd = document.getElementById('needleDark');
    const txtL = document.getElementById('textLight');
    const txtD = document.getElementById('textDark');

    const len = tl.getTotalLength();
    tl.style.strokeDasharray = len;
    td.style.strokeDasharray = len;

    function play() {
      // Scene 0: Reset
      nl.style.transition = 'none';
      nd.style.transition = 'none';
      nl.style.opacity = '0';
      nd.style.opacity = '0';
      nl.style.transform = 'translate(-40px, 40px) rotate(-3deg)';
      nd.style.transform = 'translate(-40px, 40px) rotate(-3deg)';

      tl.style.transition = 'none';
      td.style.transition = 'none';
      tl.style.strokeDashoffset = len;
      td.style.strokeDashoffset = len;
      tl.style.fill = 'transparent';
      td.style.fill = 'transparent';

      txtL.style.transition = 'none';
      txtD.style.transition = 'none';
      txtL.style.opacity = '0';
      txtD.style.opacity = '0';
      txtL.style.transform = 'translateY(10px)';
      txtD.style.transform = 'translateY(10px)';

      // Scene 1: Needle Appears (0.1s - 0.9s)
      setTimeout(() => {
        nl.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out';
        nd.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out';
        nl.style.opacity = '1';
        nd.style.opacity = '1';
        nl.style.transform = 'translate(0, 0) rotate(0deg)';
        nd.style.transform = 'translate(0, 0) rotate(0deg)';
      }, 100);

      // Scene 2 & 3: Thread Traces S-Shape (0.9s - 3.4s)
      setTimeout(() => {
        tl.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        td.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        tl.style.strokeDashoffset = '0';
        td.style.strokeDashoffset = '0';
      }, 900);

      // Scene 4: Settle & Solidify Fill (3.3s)
      setTimeout(() => {
        tl.style.transition = 'fill 0.4s ease-out';
        td.style.transition = 'fill 0.4s ease-out';
        tl.style.fill = '#131313';
        td.style.fill = '#FFFFFF';
      }, 3300);

      // Scene 5: Typography Reveals (3.8s)
      setTimeout(() => {
        txtL.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        txtD.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        txtL.style.opacity = '1';
        txtD.style.opacity = '1';
        txtL.style.transform = 'translateY(0)';
        txtD.style.transform = 'translateY(0)';
      }, 3800);
    }

    window.onload = play;
  </script>
</body>
</html>`;

fs.writeFileSync('scratch/test_exact_solution.html', html);
console.log('Saved scratch/test_exact_solution.html');

