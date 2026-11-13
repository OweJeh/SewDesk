const fs = require('fs');

const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

const needleInner = needleSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();
const threadInner = threadSvg.replace(/<\/?svg[^>]*>/g, '').replace(/<\?xml[^>]*\?>/g, '').replace(/<!--[^>]*-->/g, '').trim();

// 1. sewdesk-symbol.svg (monochrome currentColor)
const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 360" fill="none">
  <!-- SewDesk Official Brand Signature Symbol -->
  <!-- Bespoke tailoring needle crossing through continuous stitched 'S' thread monogram -->
  <g id="sewdesk-thread">
    ${threadInner}
  </g>
  <g id="sewdesk-needle">
    ${needleInner}
  </g>
</svg>
`;
fs.writeFileSync('public/icons/sewdesk-symbol.svg', symbolSvg);

// 2. sewdesk-wordmark.svg
const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" fill="none">
  <!-- SewDesk Official Wordmark & Brand Line -->
  <text x="200" y="65" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="currentColor" text-anchor="middle" letter-spacing="-0.02em">SewDesk</text>
  <text x="200" y="102" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="currentColor" text-anchor="middle" letter-spacing="0.35em" opacity="0.75">MEASURE. MANAGE. CREATE.</text>
</svg>
`;
fs.writeFileSync('public/icons/sewdesk-wordmark.svg', wordmarkSvg);

// Function to generate full logo lockup
function createFullLogo(color, subColor, comment) {
  // Replace colors in needle and thread
  const needleColored = needleInner
    .replace(/fill="#090A0A"/g, `fill="${color}"`)
    .replace(/fill="#4E4E4E"/g, `fill="${color}" opacity="0.8"`);
  
  const threadColored = threadInner
    .replace(/fill="#131313"/g, `fill="${color}"`)
    .replace(/fill="#505050"/g, `fill="${color}" opacity="0.65"`)
    .replace(/fill="#4C4C4C"/g, `fill="${color}" opacity="0.65"`)
    .replace(/fill="#565656"/g, `fill="${color}" opacity="0.65"`)
    .replace(/fill="#636363"/g, `fill="${color}" opacity="0.65"`)
    .replace(/fill="#575757"/g, `fill="${color}" opacity="0.65"`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 520" fill="none">
  <!-- ${comment} -->
  <g transform="translate(55, 20)">
    <g id="thread">
      ${threadColored}
    </g>
    <g id="needle">
      ${needleColored}
    </g>
  </g>
  <text x="220" y="430" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" fill="${color}" text-anchor="middle" letter-spacing="-0.02em">SewDesk</text>
  <text x="220" y="475" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="${subColor}" text-anchor="middle" letter-spacing="0.32em">MEASURE. MANAGE. CREATE.</text>
</svg>
`;
}

// 3. sewdesk-logo.svg (Default black mark on transparent)
fs.writeFileSync('public/icons/sewdesk-logo.svg', createFullLogo('#000000', '#666666', 'SewDesk Official Primary Logo (Black on Transparent)'));

// 4. sewdesk-logo-black.svg
fs.writeFileSync('public/icons/sewdesk-logo-black.svg', createFullLogo('#000000', '#666666', 'SewDesk Official Logo - Black Variant'));

// 5. sewdesk-logo-white.svg
fs.writeFileSync('public/icons/sewdesk-logo-white.svg', createFullLogo('#FFFFFF', '#AAAAAA', 'SewDesk Official Logo - White Inverted Variant'));

console.log('All 5 brand SVG assets generated successfully in public/icons/');

