const fs = require('fs');

function getBounds(svgStr) {
  // Extract all paths with their transforms
  const pathRegex = /<path\s+d="([^"]+)"(?:\s+fill="[^"]*")?(?:\s+transform="translate\(([^,]+),([^)]+)\)")?/g;
  let m;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  while ((m = pathRegex.exec(svgStr)) !== null) {
    const d = m[1];
    const tx = m[2] ? parseFloat(m[2]) : 0;
    const ty = m[3] ? parseFloat(m[3]) : 0;

    // Split numbers
    const nums = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (!nums) continue;
    
    // Commands parse
    // Very simple: coordinates are in pairs (x, y)
    // Note: in VTracer path, M x y, C x1 y1 x2 y2 x y
    // All numbers are coordinates relative to tx, ty!
    for (let i = 0; i < nums.length; i += 2) {
      if (i + 1 >= nums.length) break;
      const x = parseFloat(nums[i]) + tx;
      const y = parseFloat(nums[i+1]) + ty;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

console.log('Needle bounds:', getBounds(needle));
console.log('Thread bounds:', getBounds(thread));

