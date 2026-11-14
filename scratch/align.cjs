const fs = require('fs');

const needleSvg = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

console.log('Needle SVG:');
console.log(needleSvg);

console.log('\n--- Thread SVG: ---');
console.log(threadSvg);

