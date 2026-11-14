const fs = require('fs');

// Let's inspect where the strokes cross or connect in thread svg.svg
const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');

// In scratch/trace_segs.cjs we saw:
// Seg 6 ends at (232.0, 164.0)
// Seg 20-23 goes from (111.7, 101.3) to (195.9, 166.8)
// Seg 24 starts at (195.9, 166.8) and goes to (306.8, 243.4)
// Seg 55-56 goes from (176.0, 173.8) to (150.0, 163.0)

console.log('Notice that at the waist (around x=195-230, y=160-170):');
console.log('1. The right side of the top loop comes down to (232, 164)');
console.log('2. The left side of the top loop comes down to (196, 167)');
console.log('3. The lower loop starts from (196, 167) and sweeps down to (307, 243)');

