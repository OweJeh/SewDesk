const fs = require('fs');

const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const threadD = match[1];
const threadTx = match[2];
const threadTy = match[3];

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// Approach thread:
// Starts at (315, 18), flexes slightly, and passes cleanly into the eye at (255, 46) and through to (235, 58)
const threadEntryPath = "M 315 18 C 290 26, 272 38, 255 46 L 240 54";

const html = `<!DOCTYPE html>
<html>
<head>
<title>SewDesk Threading Verification</title>
<style>
  body { background: #0f1115; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .screen { background: #fff; width: 360px; height: 420px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .btn { margin-top: 24px; padding: 10px 24px; font-weight: 600; border-radius: 999px; background: #fff; color: #000; border: none; cursor: pointer; }
</style>
</head>
<body>
  <div class="screen">
    <div style="width: 80px; height: 90px; position: relative;">
      <svg viewBox="0 0 330 360" fill="none" style="width: 100%; height: 100%; overflow: visible;">
        <!-- Thread Entry Leader (Approaches & pulls through eye) -->
        <path id="entryThread"
          d="${threadEntryPath}"
          fill="none"
          stroke="#000"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Main S-Thread (Draws out of eye to form logo) -->
        <path id="mainThread"
          d="${threadD}"
          transform="translate(${threadTx}, ${threadTy})"
          fill="transparent"
          stroke="#000"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Needle Layer (On top, hollow eye frames the thread) -->
        <g id="needle">
          ${needleInner}
        </g>
      </svg>
    </div>

    <!-- Typography -->
    <div id="wordmark" style="text-align: center; margin-top: 12px; opacity: 0; transform: translateY(8px); transition: opacity 0.6s ease-out, transform 0.6s ease-out;">
      <div style="font-weight: 800; font-size: 22px; color: #000; letter-spacing: -0.02em;">SewDesk</div>
      <div style="font-weight: 600; font-size: 8px; color: #777; letter-spacing: 0.28em; text-transform: uppercase; margin-top: 4px;">MEASURE. MANAGE. CREATE.</div>
    </div>
  </div>

  <button class="btn" onclick="play()">Play Threading Animation</button>

  <script>
    const entry = document.getElementById('entryThread');
    const main = document.getElementById('mainThread');
    const needle = document.getElementById('needle');
    const wordmark = document.getElementById('wordmark');

    const entryLen = entry.getTotalLength();
    const mainLen = main.getTotalLength();

    entry.style.strokeDasharray = entryLen;
    main.style.strokeDasharray = mainLen;

    function play() {
      // Reset
      needle.style.transition = 'none';
      needle.style.opacity = '0';
      needle.style.transform = 'translate(-40px, 40px)';

      entry.style.transition = 'none';
      entry.style.opacity = '0';
      entry.style.strokeDashoffset = entryLen;

      main.style.transition = 'none';
      main.style.strokeDashoffset = mainLen;
      main.style.fill = 'transparent';

      wordmark.style.transition = 'none';
      wordmark.style.opacity = '0';
      wordmark.style.transform = 'translateY(8px)';

      // Scene 1: Needle Enters (0.1s - 0.9s)
      setTimeout(() => {
        needle.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out';
        needle.style.opacity = '1';
        needle.style.transform = 'translate(0, 0)';
      }, 100);

      // Scene 2: Thread Enters & Threads the Eye (0.9s - 1.7s)
      setTimeout(() => {
        entry.style.opacity = '1';
        // Stroke draws into and through the eye
        entry.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        entry.style.strokeDashoffset = '0';
      }, 900);

      // Scene 3: Thread is Pulled Through Eye & Draws the S-Shape (1.7s - 3.8s)
      setTimeout(() => {
        // Main thread draws out of eye to create the S
        main.style.transition = 'stroke-dashoffset 2.1s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        main.style.strokeDashoffset = '0';

        // Simultaneously, the entry tail pulls through the eye and disappears!
        entry.style.transition = 'stroke-dashoffset 1.0s ease-in, opacity 0.8s ease-in';
        entry.style.strokeDashoffset = -entryLen;
        entry.style.opacity = '0';
      }, 1700);

      // Scene 4: Settle & Solidify Logo (3.8s)
      setTimeout(() => {
        main.style.transition = 'fill 0.35s ease-out';
        main.style.fill = '#131313';
      }, 3800);

      // Scene 5: Typography Reveals (4.2s)
      setTimeout(() => {
        wordmark.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        wordmark.style.opacity = '1';
        wordmark.style.transform = 'translateY(0)';
      }, 4200);
    }

    window.onload = play;
  </script>
</body>
</html>`;

fs.writeFileSync('scratch/test_threading_story.html', html);
console.log('Saved scratch/test_threading_story.html');

