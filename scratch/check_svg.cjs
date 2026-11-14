const fs = require('fs');

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

console.log('--- Needle SVG ---');
console.log(needle);

console.log('--- Thread SVG ---');
console.log(thread);

