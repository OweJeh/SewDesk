const fs = require('fs');

const content = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = content.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);

if (match) {
  const d = match[1];
  const tx = parseFloat(match[2]);
  const ty = parseFloat(match[3]);
  
  // Let's parse commands
  // Split by commands M, C, Z etc.
  const regex = /([MCZ])([^MCZ]*)/g;
  let m;
  const commands = [];
  while ((m = regex.exec(d)) !== null) {
    const type = m[1];
    const args = m[2].trim().split(/\s+/).filter(Boolean).map(Number);
    commands.push({ type, args });
  }

  console.log('Total commands:', commands.length);
  
  // Compute points along the path
  let currentX = tx;
  let currentY = ty;
  const pathPoints = [];

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      currentX = tx + cmd.args[0];
      currentY = ty + cmd.args[1];
      pathPoints.push({ type: 'M', x: currentX, y: currentY });
    } else if (cmd.type === 'C') {
      // In relative or absolute?
      // In SVG paths from VTracer:
      // Notice: "M0 0 C0.79 0.69 1.58 1.37 2.4 2.08 C3.23 ..."
      // These are relative to the transform origin (0, 0)!
      // In SVG: uppercase 'C' followed by coordinate pairs are absolute coordinates within the element's coordinate space (before translate)!
      for (let i = 0; i < cmd.args.length; i += 6) {
        const cp1x = tx + cmd.args[i];
        const cp1y = ty + cmd.args[i+1];
        const cp2x = tx + cmd.args[i+2];
        const cp2y = ty + cmd.args[i+3];
        const endX = tx + cmd.args[i+4];
        const endY = ty + cmd.args[i+5];
        currentX = endX;
        currentY = endY;
        pathPoints.push({ type: 'C', x: endX, y: endY, cp1: {x: cp1x, y: cp1y}, cp2: {x: cp2x, y: cp2y} });
      }
    } else if (cmd.type === 'Z') {
      pathPoints.push({ type: 'Z' });
    }
  }

  console.log('First 5 points:', pathPoints.slice(0, 5));
  console.log('Middle point:', pathPoints[Math.floor(pathPoints.length / 2)]);
  console.log('Last 5 points:', pathPoints.slice(-5));
  console.log('Total points in outline:', pathPoints.length);
}

