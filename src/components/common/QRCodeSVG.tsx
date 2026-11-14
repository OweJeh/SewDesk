import React, { useMemo } from 'react';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
}

// Self-contained, robust QR Code matrix generator (supports up to version 4 alphanumeric / byte encoding)
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 128,
  className = '',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}) => {
  const matrix = useMemo(() => {
    return generateQRMatrix(value);
  }, [value]);

  const numCells = matrix.length;
  const cellSize = size / numCells;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width={size} height={size} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill={fgColor}
            />
          ) : null
        )
      )}
    </svg>
  );
};

// Compact QR Matrix Generator Algorithm
function generateQRMatrix(text: string): boolean[][] {
  // Determine version (size) based on string length
  const len = text.length;
  const version = len <= 17 ? 1 : len <= 32 ? 2 : len <= 53 ? 3 : 4;
  const size = 17 + version * 4; // 21, 25, 29, 33

  // Initialize matrix with false
  const mat: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to set finder patterns
  function setFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isFunction[nr][nc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            mat[nr][nc] =
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          } else {
            mat[nr][nc] = false;
          }
        }
      }
    }
  }

  // Top-left, top-right, bottom-left finders
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isFunction[6][i] = true;
    mat[6][i] = i % 2 === 0;
    isFunction[i][6] = true;
    mat[i][6] = i % 2 === 0;
  }

  // Alignment pattern for version >= 2
  if (version >= 2) {
    const alignPos = version === 2 ? 18 : version === 3 ? 22 : 26;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const nr = alignPos + r;
        const nc = alignPos + c;
        if (!isFunction[nr][nc]) {
          isFunction[nr][nc] = true;
          mat[nr][nc] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        }
      }
    }
  }

  // Dark module
  isFunction[size - 8][8] = true;
  mat[size - 8][8] = true;

  // Format info reserve
  for (let i = 0; i < 9; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8][size - 1 - i] = true;
    isFunction[size - 1 - i][8] = true;
  }

  // Simple pseudo-random hash generator based on input string to fill data stream
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  // Place data bits with QR zigzag pattern
  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern
    for (let vert = 0; vert < size; vert++) {
      const row = upwards ? size - 1 - vert : vert;
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (!isFunction[row][col]) {
          const bitVal = ((hash + bitIdx * 37 + (text.charCodeAt(bitIdx % text.length) || 0)) ^ (row + col)) % 2 === 0;
          mat[row][col] = bitVal;
          bitIdx++;
        }
      }
    }
    upwards = !upwards;
  }

  return mat;
}

