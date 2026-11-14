const fs = require('fs');

const needle = fs.readFileSync('public/icons/needle svg.svg', 'utf8');
const thread = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// Let's inspect the SVG text of both
console.log('Needle SVG length:', needle.length);
console.log('Thread SVG length:', thread.length);

