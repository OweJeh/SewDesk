const fs = require('fs');

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

const needleInner = needle.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();
const threadInner = thread.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// Case A: Needle Behind, Thread on Top
const caseA = `
<svg width="330" height="360" viewBox="0 0 330 360" fill="none">
  <g id="needle">${needleInner}</g>
  <g id="thread">${threadInner}</g>
</svg>
`;

// Case B: Thread Behind, Needle on Top
const caseB = `
<svg width="330" height="360" viewBox="0 0 330 360" fill="none">
  <g id="thread">${threadInner}</g>
  <g id="needle">${needleInner}</g>
</svg>
`;

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #f0f0f0; display: flex; gap: 40px; padding: 40px; font-family: sans-serif; }
  .card { background: white; padding: 20px; border-radius: 12px; }
</style>
</head>
<body>
  <div class="card">
    <h3>Layering A: Needle behind, Thread on top</h3>
    ${caseA}
  </div>
  <div class="card">
    <h3>Layering B: Thread behind, Needle on top</h3>
    ${caseB}
  </div>
</body>
</html>`;

fs.writeFileSync('scratch/compare_layering.html', html);
console.log('Saved scratch/compare_layering.html');

