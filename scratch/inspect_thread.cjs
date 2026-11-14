const fs = require('fs');

const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Parse SVG path data to calculate absolute bounding boxes
function parsePathCommands(d, tx = 0, ty = 0) {
  const tokens = d.match(/([a-zA-Z])|([-+]?[0-9]*\.?[0-9]+)/g);
  let curX = 0, curY = 0;
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  const points = [];

  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M' || cmd === 'L') {
      curX = parseFloat(tokens[i+1]) + tx;
      curY = parseFloat(tokens[i+2]) + ty;
      i += 3;
    } else if (cmd === 'C') {
      const x1 = parseFloat(tokens[i+1]) + tx;
      const y1 = parseFloat(tokens[i+2]) + ty;
      const x2 = parseFloat(tokens[i+3]) + tx;
      const y2 = parseFloat(tokens[i+4]) + ty;
      curX = parseFloat(tokens[i+5]) + tx;
      curY = parseFloat(tokens[i+6]) + ty;
      i += 7;
      points.push({ x: curX, y: curY });
    } else if (cmd === 'Z' || cmd === 'z') {
      i += 1;
      continue;
    } else {
      // Numbers continuing previous command (e.g. repeated C)
      const x1 = parseFloat(tokens[i]) + tx;
      const y1 = parseFloat(tokens[i+1]) + tx;
      const x2 = parseFloat(tokens[i+2]) + tx;
      const y2 = parseFloat(tokens[i+3]) + tx;
      curX = parseFloat(tokens[i+4]) + tx;
      curY = parseFloat(tokens[i+5]) + ty;
      i += 6;
      points.push({ x: curX, y: curY });
    }
    if (curX < minX) minX = curX;
    if (curX > maxX) maxX = curX;
    if (curY < minY) minY = curY;
    if (curY > maxY) maxY = curY;
  }
  return { minX, maxX, minY, maxY, points };
}

// Needle main path
const needleD = needleSvg.match(/<path d="([^"]+)"/)[1];
const needleBox = parsePathCommands(needleD, 275, 14);
console.log('Needle absolute bounds:', needleBox.minX, needleBox.maxX, needleBox.minY, needleBox.maxY);

// Thread main path
const threadD = threadSvg.match(/<path d="([^"]+)"/)[1];
const threadBox = parsePathCommands(threadD, 271.6015625, 40.921875);
console.log('Thread absolute bounds:', threadBox.minX, threadBox.maxX, threadBox.minY, threadBox.maxY);

