const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');

// Let's create an HTML file that renders thread svg by itself, needle svg by itself, and both together
const html = `<!DOCTYPE html>
<html>
<head>
<title>Thread Inspection</title>
<style>
  body { background: #f0f0f0; padding: 40px; font-family: sans-serif; }
  .grid { display: flex; gap: 30px; }
  .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  svg { border: 1px dashed #ccc; }
</style>
</head>
<body>
  <div class="grid">
    <div class="card">
      <h3>1. Needle Alone</h3>
      <svg width="330" height="360" viewBox="0 0 330 360">
        ${needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}
      </svg>
    </div>
    <div class="card">
      <h3>2. Thread Alone (As in thread svg.svg)</h3>
      <svg width="330" height="360" viewBox="0 0 330 360">
        ${threadSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}
      </svg>
    </div>
    <div class="card">
      <h3>3. Both Together (Official Lockup)</h3>
      <svg width="330" height="360" viewBox="0 0 330 360">
        <g>${needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}</g>
        <g>${threadSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}</g>
      </svg>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('scratch/visualize_exact_svg.html', html);
console.log('Saved scratch/visualize_exact_svg.html');

