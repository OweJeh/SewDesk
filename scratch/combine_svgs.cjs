const fs = require('fs');

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Combine into single SVG
const combined = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 360" width="330" height="360">
  <!-- Needle -->
  <g id="needle">
    ${needle.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}
  </g>
  <!-- Thread -->
  <g id="thread">
    ${thread.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim()}
  </g>
</svg>`;

fs.writeFileSync('public/test-svg-combined.svg', combined);
console.log('Written test-svg-combined.svg');

