const fs = require('fs');

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

const needleInner = needle.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();
const threadInner = thread.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

const html = `<!DOCTYPE html>
<html>
<head>
<title>SewDesk Brand Alignment Inspection</title>
<style>
  body {
    background: #0f1115;
    color: #e5e5e5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    gap: 30px;
  }
  .card-container {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .card {
    background: #ffffff;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card.dark {
    background: #18191c;
    border: 1px solid #2d3139;
  }
  h2 { margin-top: 0; font-size: 18px; color: #333; }
  .card.dark h2 { color: #fff; }
  svg { display: block; }
</style>
</head>
<body>
  <h1>SewDesk Official Logo & Animation Asset Studio</h1>
  <div class="card-container">
    <div class="card">
      <h2>White Background (Light Mode)</h2>
      <svg width="330" height="360" viewBox="0 0 330 360" fill="none">
        <g id="needle-group">
          ${needleInner}
        </g>
        <g id="thread-group">
          ${threadInner}
        </g>
      </svg>
      <div style="font-weight: 800; font-size: 32px; color: #111; margin-top: 20px; font-family: Inter, sans-serif;">SewDesk</div>
      <div style="font-weight: 600; font-size: 10px; color: #777; letter-spacing: 0.35em; margin-top: 8px;">MEASURE. MANAGE. CREATE.</div>
    </div>

    <div class="card dark">
      <h2>Dark Background (Inverted)</h2>
      <svg width="330" height="360" viewBox="0 0 330 360" fill="none">
        <g id="needle-group-dark" style="filter: invert(1);">
          ${needleInner}
        </g>
        <g id="thread-group-dark" style="filter: invert(1);">
          ${threadInner}
        </g>
      </svg>
      <div style="font-weight: 800; font-size: 32px; color: #fff; margin-top: 20px; font-family: Inter, sans-serif;">SewDesk</div>
      <div style="font-weight: 600; font-size: 10px; color: #aaa; letter-spacing: 0.35em; margin-top: 8px;">MEASURE. MANAGE. CREATE.</div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('public/brand-preview.html', html);
console.log('Saved public/brand-preview.html');

