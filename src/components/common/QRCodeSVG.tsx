import React, { useMemo } from 'react';
import QRCode from 'qrcode';

export interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Standard ISO/IEC 18004 compliant QR Code SVG component.
 * Uses standard Reed-Solomon error correction and standard data masking
 * so phone cameras and barcode scanners can instantly scan it.
 */
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 128,
  className = '',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  margin = 2,
  errorCorrectionLevel = 'M',
}) => {
  const qrData = useMemo(() => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    try {
      const qr = QRCode.create(value, {
        errorCorrectionLevel,
      });

      const moduleCount = qr.modules.size;
      const totalSize = moduleCount + margin * 2;

      // Construct a single optimized SVG path for all dark modules
      let path = '';
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.modules.get(r, c)) {
            const x = c + margin;
            const y = r + margin;
            path += `M${x},${y}h1v1h-1z `;
          }
        }
      }

      return { totalSize, path };
    } catch (err) {
      console.error('Failed to generate compliant QR code:', err);
      return null;
    }
  }, [value, margin, errorCorrectionLevel]);

  if (!qrData) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-neutral-100 text-[10px] text-neutral-400 font-mono rounded ${className}`}
      >
        Invalid QR
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${qrData.totalSize} ${qrData.totalSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      <rect width="100%" height="100%" fill={bgColor} />
      <path d={qrData.path} fill={fgColor} />
    </svg>
  );
};
