const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = match[2];
const ty = match[3];

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// Let's create an HTML file that renders 5 snapshots of the animation at 0%, 25%, 50%, 75%, 100%!
// In SVG, stroke-dashoffset:
// len = totalLength

const html = `<!DOCTYPE html>
<html>
<head>
<title>Animation Progression Snapshots</title>
<style>
  body { background: #f5f5f5; font-family: sans-serif; padding: 20px; }
  .row { display: flex; gap: 20px; flex-wrap: wrap; }
  .card { background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; }
  svg { border: 1px dashed #ccc; width: 180px; height: 200px; }
  h4 { margin: 5px 0 10px 0; font-size: 13px; color: #333; }
</style>
</head>
<body>
  <h2>Tracing Progression on Exact Vector Path</h2>
  <div class="row" id="snapshots"></div>

  <svg style="display:none;">
    <path id="measurer" d="${d}" />
  </svg>

  <script>
    const m = document.getElementById('measurer');
    const totalLen = m.getTotalLength();
    console.log('Total length of exact path:', totalLen);

    const steps = [
      { name: '1. Start (Eye)', frac: 0.05, fill: 'transparent' },
      { name: '2. Upper Loop Draw', frac: 0.25, fill: 'transparent' },
      { name: '3. Lower Loop & Flourish', frac: 0.50, fill: 'transparent' },
      { name: '4. Return to Eye', frac: 0.85, fill: 'transparent' },
      { name: '5. Settle & Solidify', frac: 1.0, fill: '#000000' }
    ];

    const container = document.getElementById('snapshots');
    steps.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      const offset = totalLen * (1 - s.frac);
      card.innerHTML = \`
        <h4>\${s.name}</h4>
        <svg viewBox="0 0 330 360" fill="none">
          <g>\${${JSON.stringify(needleInner)}}</g>
          <path
            d="\${${JSON.stringify(d)}}"
            transform="translate(\${${JSON.stringify(tx)}}, \${${JSON.stringify(ty)}})"
            fill="\${s.fill}"
            stroke="#000000"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="\${totalLen}"
            stroke-dashoffset="\${offset}"
          />
        </svg>
      \`;
      container.appendChild(card);
    });
  </script>
</body>
</html>`;

fs.writeFileSync('scratch/snapshots.html', html);
console.log('Saved scratch/snapshots.html');

