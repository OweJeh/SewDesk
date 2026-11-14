const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

function parsePathPoints(d, tx = 0, ty = 0) {
  const tokens = d.match(/([a-zA-Z])|([-+]?[0-9]*\.?[0-9]+)/g);
  let curX = 0, curY = 0;
  const points = [];

  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M' || cmd === 'L') {
      curX = parseFloat(tokens[i+1]) + tx;
      curY = parseFloat(tokens[i+2]) + ty;
      points.push({ cmd: 'M', x: curX, y: curY });
      i += 3;
    } else if (cmd === 'C') {
      const x1 = parseFloat(tokens[i+1]) + tx;
      const y1 = parseFloat(tokens[i+2]) + ty;
      const x2 = parseFloat(tokens[i+3]) + tx;
      const y2 = parseFloat(tokens[i+4]) + ty;
      curX = parseFloat(tokens[i+5]) + tx;
      curY = parseFloat(tokens[i+6]) + ty;
      points.push({ cmd: 'C', x1, y1, x2, y2, x: curX, y: curY });
      i += 7;
    } else if (cmd === 'Z' || cmd === 'z') {
      points.push({ cmd: 'Z' });
      i += 1;
    } else {
      const x1 = parseFloat(tokens[i]) + tx;
      const y1 = parseFloat(tokens[i+1]) + ty;
      const x2 = parseFloat(tokens[i+2]) + ty;
      const y2 = parseFloat(tokens[i+3]) + tx; // wait!
      curX = parseFloat(tokens[i+4]) + tx;
      curY = parseFloat(tokens[i+5]) + ty;
      points.push({ cmd: 'C', x1, y1, x2, y2, x: curX, y: curY });
      i += 6;
    }
  }
  return points;
}

const threadD = threadSvg.match(/<path d="([^"]+)"/)[1];
console.log('Path starts with:', threadD.slice(0, 100));
console.log('Path ends with:', threadD.slice(-100));
