const fs = require('fs');

// Normalized Coordinates (viewBox 0 0 300 300)
// Needle
const needlePath = `M 56.0 276.4
L 163.7 134.4
C 166.0 130.5, 169.1 126.6, 173.0 121.2
L 184.7 105.6
C 187.1 102.5, 191.0 101.7, 193.3 104.0
C 195.6 106.4, 195.6 110.3, 192.5 114.2
L 181.6 129.0
C 177.7 134.4, 173.8 139.1, 170.7 143.0
L 59.9 278.0
Z
M 176.1 114.9
C 173.8 118.1, 173.0 120.4, 175.3 123.5
L 181.6 131.3
C 183.9 134.4, 187.1 133.6, 188.6 131.3
C 190.2 128.2, 190.2 125.8, 187.9 122.7
L 181.6 114.9
C 180.1 112.6, 177.7 112.6, 176.1 114.9
Z`;

// Continuous S-Thread Path (from bottom-left arc up to eye, or eye around S)
// For static logo:
const threadPath = `M 99.7 138.3
C 71.6 148.4, 63.8 185.1, 87.2 210.8
C 104.4 228.0, 141.0 231.1, 180.0 221.8
C 219.0 210.8, 247.9 187.4, 241.7 156.2
C 235.4 126.6, 193.3 118.8, 152.7 131.3
C 117.6 99.3, 107.5 60.3, 143.4 29.1
C 176.1 1.8, 226.8 13.5, 237.0 52.5
C 244.8 83.7, 199.5 114.9, 177.7 120.4`;

// Drawing Order Path for Animation (starts at eye 177.7 120.4, draws upper loop, then lower loop)
const threadAnimationPath = `M 177.7 120.4
C 199.5 114.9, 244.8 83.7, 237.0 52.5
C 226.8 13.5, 176.1 1.8, 143.4 29.1
C 107.5 60.3, 117.6 99.3, 152.7 131.3
C 193.3 118.8, 235.4 126.6, 241.7 156.2
C 247.9 187.4, 219.0 210.8, 180.0 221.8
C 141.0 231.1, 104.4 228.0, 87.2 210.8
C 63.8 185.1, 71.6 148.4, 99.7 138.3`;

// Thread approach path (Scene 2): from outside right into eye
const threadApproachPath = `M 245.0 75.0 C 228.0 90.0, 202.0 108.0, 177.7 120.4`;

// 1. sewdesk-symbol.svg (Pure Black)
const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
  <!-- SewDesk Official Brand Signature Symbol -->
  <!-- Hand-crafted bespoke tailoring needle & continuous stitched 'S' monogram -->
  <path
    d="${needlePath.replace(/\n\s*/g, ' ')}"
    fill="currentColor"
    fill-rule="evenodd"
  />
  <path
    d="${threadPath.replace(/\n\s*/g, ' ')}"
    stroke="currentColor"
    stroke-width="4.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`;

// 2. sewdesk-wordmark.svg
const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 90" fill="none">
  <!-- SewDesk Official Typography Wordmark -->
  <text x="200" y="52" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="currentColor" letter-spacing="-1.8">
    SewDesk
  </text>
  <text x="200" y="78" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="600" fill="#777777" letter-spacing="4.5">
    MEASURE. MANAGE. CREATE.
  </text>
</svg>
`;

// 3. sewdesk-logo.svg (Master Lockup, Black on transparent)
const logoBlackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 460" fill="none">
  <!-- SewDesk Master Brand Identity Lockup (Black on Transparent) -->
  <g transform="translate(100, 10)">
    <path
      d="${needlePath.replace(/\n\s*/g, ' ')}"
      fill="#000000"
      fill-rule="evenodd"
    />
    <path
      d="${threadPath.replace(/\n\s*/g, ' ')}"
      stroke="#000000"
      stroke-width="4.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
  <text x="250" y="380" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="62" font-weight="800" fill="#000000" letter-spacing="-2.2">
    SewDesk
  </text>
  <text x="250" y="414" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#000000" letter-spacing="4.8">
    MEASURE. MANAGE. CREATE.
  </text>
</svg>
`;

// 4. sewdesk-logo-white.svg (White on transparent)
const logoWhiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 460" fill="none">
  <!-- SewDesk Master Brand Identity Lockup (White on Transparent) -->
  <g transform="translate(100, 10)">
    <path
      d="${needlePath.replace(/\n\s*/g, ' ')}"
      fill="#FFFFFF"
      fill-rule="evenodd"
    />
    <path
      d="${threadPath.replace(/\n\s*/g, ' ')}"
      stroke="#FFFFFF"
      stroke-width="4.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
  <text x="250" y="380" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="62" font-weight="800" fill="#FFFFFF" letter-spacing="-2.2">
    SewDesk
  </text>
  <text x="250" y="414" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#FFFFFF" letter-spacing="4.8">
    MEASURE. MANAGE. CREATE.
  </text>
</svg>
`;

fs.writeFileSync('public/icons/sewdesk-symbol.svg', symbolSvg);
fs.writeFileSync('public/icons/sewdesk-wordmark.svg', wordmarkSvg);
fs.writeFileSync('public/icons/sewdesk-logo.svg', logoBlackSvg);
fs.writeFileSync('public/icons/sewdesk-logo-black.svg', logoBlackSvg);
fs.writeFileSync('public/icons/sewdesk-logo-white.svg', logoWhiteSvg);

// Export paths as JS module for components
const exportJs = `// Auto-generated exact vector paths matching SewDesk signature brand mark
export const SEWDESK_NEEDLE_PATH = "${needlePath.replace(/\n\s*/g, ' ')}";
export const SEWDESK_THREAD_PATH = "${threadPath.replace(/\n\s*/g, ' ')}";
export const SEWDESK_THREAD_ANIM_PATH = "${threadAnimationPath.replace(/\n\s*/g, ' ')}";
export const SEWDESK_THREAD_APPROACH_PATH = "${threadApproachPath.replace(/\n\s*/g, ' ')}";
`;
fs.writeFileSync('src/components/brand/paths.ts', exportJs);

console.log('All SVG assets and paths.ts successfully generated!');
