const fs = require('fs');

const threadSvg = fs.readFileSync('public/icons/thread svg.svg', 'utf8');
const match = threadSvg.match(/<path d="([^"]+)" fill="#131313" transform="translate\(([^,]+),([^)]+)\)"/);
const d = match[1];
const tx = parseFloat(match[2]);
const ty = parseFloat(match[3]);

// Let's trace both lobes:
// LOBE 1: Top loop
// It starts at needle eye (255, 48)
// Loops around the top:
// Right side: (271.6, 40.9) -> (301.3, 93.1) -> (281.5, 141.7) -> (232.0, 164.0)
// Center crossing: (232.0, 164.0) to (195.9, 166.8)
// Left side: (195.9, 166.8) <- (158.0, 151.0) <- (111.7, 101.3) <- (117.4, 65.5) <- (173.0, 19.0) <- (271.6, 40.9)
// It is an entire closed oval loop!

// LOBE 2: Lower loop + Crescent
// Waist crossing: (195.9, 166.8)
// Right belly: (306.8, 243.4) -> (309.0, 287.0) -> (270.6, 327.0)
// Bottom base: (108.1, 340.2) -> (46.4, 306.4) -> (22.8, 262.8)
// Crescent tip: (22.8, 262.8) -> (79.0, 188.0)

console.log('Lobe 1 and Lobe 2 identified!');

