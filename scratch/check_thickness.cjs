const fs = require('fs');

// In scratch/calc_points.cjs we saw:
// Pt 0: (271.6, 40.9) and Pt 64: (271.6, 40.9)
// Let's find the width of the thread stroke at different points:
// Pt 3 is (301.3, 93.1) on outer edge
// Pt 10 is (286.2, 112.3)
// Distance between outer and inner edges is typically 8 to 16 viewBox units!
console.log('Thread outline thickness in viewBox units is around 8 to 14 units.');

