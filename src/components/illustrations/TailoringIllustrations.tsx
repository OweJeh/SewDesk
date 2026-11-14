import React from 'react';

/**
 * Digital illustration-style SVG illustrations for SewDesk home page.
 * Each illustration is a minimal, elegant line-art composition
 * inspired by tailoring tools and fashion design.
 *
 * Style: thin stroke, monochrome, luxury fashion-tech aesthetic.
 */

interface IllustrationProps {
  className?: string;
  color?: string;
}

/** Measuring tape + ruler — represents precision measurement */
export const MeasurementIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Curved measuring tape */}
    <path
      d="M30 160 C30 80, 80 40, 160 40"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Tape measurement tick marks */}
    <line x1="45" y1="147" x2="50" y2="140" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="60" y1="130" x2="66" y2="124" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="78" y1="110" x2="85" y2="106" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="98" y1="90" x2="105" y2="88" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="118" y1="72" x2="126" y2="72" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="140" y1="56" x2="148" y2="58" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

    {/* Ruler body */}
    <rect
      x="60" y="130" width="100" height="14" rx="2"
      stroke={color} strokeWidth="1.8"
      fill="none"
      transform="rotate(-25 110 137)"
    />
    {/* Ruler graduation marks */}
    {[0, 12, 24, 36, 48, 60, 72, 84, 96].map((offset, i) => (
      <line
        key={i}
        x1={63 + offset * 0.95}
        y1="132"
        x2={63 + offset * 0.95}
        y2={i % 2 === 0 ? '139' : '136'}
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        transform="rotate(-25 110 137)"
      />
    ))}

    {/* Small needle accent */}
    <line x1="150" y1="100" x2="170" y2="80" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="170" cy="80" r="2" stroke={color} strokeWidth="1.2" fill="none" />

    {/* Dimension annotation */}
    <path
      d="M30 175 L160 175"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      strokeLinecap="round"
    />
    <line x1="30" y1="170" x2="30" y2="180" stroke={color} strokeWidth="0.8" />
    <line x1="160" y1="170" x2="160" y2="180" stroke={color} strokeWidth="0.8" />
  </svg>
);

/** Dress form / mannequin with thread — represents client profiles & fitting */
export const DressFormIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Stand base */}
    <line x1="100" y1="165" x2="100" y2="185" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M75 185 Q100 180, 125 185" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Body torso outline */}
    <path
      d="M70 70 C65 80, 60 100, 62 115 C64 130, 72 145, 80 155 Q90 165, 100 165 Q110 165, 120 155 C128 145, 136 130, 138 115 C140 100, 135 80, 130 70"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Neckline */}
    <path
      d="M70 70 C80 60, 90 55, 100 53 C110 55, 120 60, 130 70"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Shoulder lines */}
    <line x1="70" y1="70" x2="50" y2="75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="130" y1="70" x2="150" y2="75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

    {/* Bust line */}
    <path
      d="M65 95 L135 95"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      strokeLinecap="round"
    />
    {/* Waist line */}
    <path
      d="M68 120 L132 120"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      strokeLinecap="round"
    />
    {/* Hip line */}
    <path
      d="M72 143 L128 143"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      strokeLinecap="round"
    />

    {/* Pins */}
    <circle cx="100" cy="95" r="1.5" fill={color} />
    <circle cx="100" cy="120" r="1.5" fill={color} />
    <circle cx="100" cy="143" r="1.5" fill={color} />

    {/* Measurement label ticks */}
    <text x="138" y="98" fontSize="7" fill={color} fontFamily="Inter, sans-serif" opacity="0.6">B</text>
    <text x="135" y="123" fontSize="7" fill={color} fontFamily="Inter, sans-serif" opacity="0.6">W</text>
    <text x="131" y="146" fontSize="7" fill={color} fontFamily="Inter, sans-serif" opacity="0.6">H</text>
  </svg>
);

/** Scissors + fabric swatch — represents production / cutting */
export const ScissorsIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Scissors blade top */}
    <path
      d="M65 85 L140 50"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Scissors blade bottom */}
    <path
      d="M65 95 L140 130"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Scissors pivot */}
    <circle cx="65" cy="90" r="4" stroke={color} strokeWidth="2" fill="none" />

    {/* Handle top — ring */}
    <ellipse cx="42" cy="78" rx="14" ry="10" stroke={color} strokeWidth="1.8" fill="none" transform="rotate(-15 42 78)" />
    {/* Handle bottom — ring */}
    <ellipse cx="42" cy="102" rx="14" ry="10" stroke={color} strokeWidth="1.8" fill="none" transform="rotate(15 42 102)" />

    {/* Handle connectors */}
    <line x1="55" y1="82" x2="62" y2="87" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="55" y1="98" x2="62" y2="93" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

    {/* Fabric swatch */}
    <rect x="115" y="135" width="55" height="40" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Fabric texture lines */}
    <line x1="125" y1="135" x2="125" y2="175" stroke={color} strokeWidth="0.5" opacity="0.3" />
    <line x1="140" y1="135" x2="140" y2="175" stroke={color} strokeWidth="0.5" opacity="0.3" />
    <line x1="155" y1="135" x2="155" y2="175" stroke={color} strokeWidth="0.5" opacity="0.3" />
    <line x1="115" y1="150" x2="170" y2="150" stroke={color} strokeWidth="0.5" opacity="0.3" />
    <line x1="115" y1="162" x2="170" y2="162" stroke={color} strokeWidth="0.5" opacity="0.3" />

    {/* Cut line */}
    <path
      d="M140 130 L145 135"
      stroke={color}
      strokeWidth="1.2"
      strokeDasharray="3 2"
      strokeLinecap="round"
    />

    {/* Thread spool accent */}
    <ellipse cx="160" cy="60" rx="12" ry="8" stroke={color} strokeWidth="1.2" fill="none" />
    <line x1="148" y1="60" x2="148" y2="50" stroke={color} strokeWidth="1" />
    <line x1="172" y1="60" x2="172" y2="50" stroke={color} strokeWidth="1" />
    <ellipse cx="160" cy="50" rx="12" ry="5" stroke={color} strokeWidth="1.2" fill="none" />
    {/* Thread trailing */}
    <path d="M160 68 C165 75, 155 80, 145 85" stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" />
  </svg>
);

/** Order clipboard + pin — represents order management */
export const OrderIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Clipboard body */}
    <rect x="50" y="40" width="100" height="135" rx="6" stroke={color} strokeWidth="2" fill="none" />
    {/* Clipboard clip */}
    <rect x="80" y="32" width="40" height="16" rx="3" stroke={color} strokeWidth="1.8" fill="none" />
    <circle cx="100" cy="40" r="3" stroke={color} strokeWidth="1.2" fill="none" />

    {/* Order line items */}
    <line x1="65" y1="70" x2="105" y2="70" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="65" y1="85" x2="120" y2="85" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="65" y1="100" x2="95" y2="100" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="65" y1="115" x2="110" y2="115" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

    {/* Checkboxes */}
    <rect x="125" y="65" width="10" height="10" rx="2" stroke={color} strokeWidth="1" fill="none" />
    <path d="M127 70 L129.5 73 L134 67" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="125" y="80" width="10" height="10" rx="2" stroke={color} strokeWidth="1" fill="none" />
    <path d="M127 85 L129.5 88 L134 82" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="125" y="95" width="10" height="10" rx="2" stroke={color} strokeWidth="1" fill="none" />
    <rect x="125" y="110" width="10" height="10" rx="2" stroke={color} strokeWidth="1" fill="none" />

    {/* Progress bar */}
    <rect x="65" y="140" width="70" height="6" rx="3" stroke={color} strokeWidth="1" fill="none" />
    <rect x="65" y="140" width="45" height="6" rx="3" fill={color} opacity="0.2" />

    {/* Status indicator */}
    <text x="65" y="160" fontSize="7" fill={color} fontFamily="Inter, sans-serif" opacity="0.5" letterSpacing="1.5">STATUS</text>
    <text x="65" y="170" fontSize="8" fill={color} fontFamily="Inter, sans-serif" fontWeight="600">IN PROGRESS</text>

    {/* Needle pin accent */}
    <line x1="145" y1="35" x2="155" y2="25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="157" cy="23" r="3" fill={color} opacity="0.15" />
    <circle cx="157" cy="23" r="3" stroke={color} strokeWidth="1" fill="none" />
  </svg>
);

/** Wallet / payment cards — represents payment ledger */
export const PaymentIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Main card */}
    <rect x="35" y="55" width="130" height="85" rx="8" stroke={color} strokeWidth="2" fill="none" />

    {/* Card stripe */}
    <line x1="35" y1="80" x2="165" y2="80" stroke={color} strokeWidth="1.5" />

    {/* Card chip */}
    <rect x="52" y="65" width="18" height="12" rx="2.5" stroke={color} strokeWidth="1.2" fill="none" />
    <line x1="52" y1="71" x2="70" y2="71" stroke={color} strokeWidth="0.6" />
    <line x1="61" y1="65" x2="61" y2="77" stroke={color} strokeWidth="0.6" />

    {/* Card number dots */}
    {[0, 1, 2, 3].map((g) => (
      <React.Fragment key={g}>
        {[0, 1, 2, 3].map((d) => (
          <circle
            key={d}
            cx={54 + g * 28 + d * 6}
            cy="97"
            r="1.5"
            fill={color}
            opacity="0.3"
          />
        ))}
      </React.Fragment>
    ))}

    {/* Expiry */}
    <text x="50" y="120" fontSize="6" fill={color} fontFamily="monospace" opacity="0.4">VALID THRU</text>
    <text x="50" y="130" fontSize="9" fill={color} fontFamily="monospace" opacity="0.5">12/27</text>

    {/* Stacked secondary card behind */}
    <rect x="42" y="50" width="130" height="85" rx="8" stroke={color} strokeWidth="1" fill="none" opacity="0.2" />

    {/* Currency symbol accent */}
    <circle cx="155" cy="155" r="14" stroke={color} strokeWidth="1.5" fill="none" />
    <text x="149" y="161" fontSize="14" fill={color} fontFamily="Inter, sans-serif" fontWeight="600" opacity="0.6">₵</text>

    {/* Deposit arrows */}
    <path d="M120 155 L140 155" stroke={color} strokeWidth="1.2" strokeLinecap="round" markerEnd="url(#arrowhead)" />
    <defs>
      <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill={color} opacity="0.6" />
      </marker>
    </defs>
  </svg>
);

/** Shield + lock — represents security / multi-tenant */
export const SecurityIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Shield outline */}
    <path
      d="M100 30 L155 55 L155 110 C155 145, 130 170, 100 180 C70 170, 45 145, 45 110 L45 55 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Inner shield border */}
    <path
      d="M100 45 L145 65 L145 108 C145 138, 123 158, 100 166 C77 158, 55 138, 55 108 L55 65 Z"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      fill="none"
      opacity="0.4"
    />

    {/* Lock body */}
    <rect x="82" y="98" width="36" height="28" rx="4" stroke={color} strokeWidth="1.8" fill="none" />
    {/* Lock shackle */}
    <path
      d="M88 98 L88 85 C88 75, 112 75, 112 85 L112 98"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* Keyhole */}
    <circle cx="100" cy="110" r="4" stroke={color} strokeWidth="1.2" fill="none" />
    <line x1="100" y1="114" x2="100" y2="120" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

    {/* Data flow lines */}
    <path d="M35 90 L42 90" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <path d="M25 105 L42 105" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <path d="M30 120 L42 120" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <path d="M158 90 L165 90" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <path d="M158 105 L175 105" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <path d="M158 120 L170 120" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
  </svg>
);

/** Smartphone with wifi / sync — represents PWA / offline */
export const PWAIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Phone body */}
    <rect x="65" y="30" width="70" height="130" rx="10" stroke={color} strokeWidth="2" fill="none" />
    {/* Screen */}
    <rect x="70" y="48" width="60" height="95" rx="2" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" />
    {/* Notch */}
    <rect x="90" y="35" width="20" height="5" rx="2.5" stroke={color} strokeWidth="1" fill="none" />
    {/* Home indicator */}
    <line x1="88" y1="153" x2="112" y2="153" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />

    {/* Wifi / sync arcs */}
    <path d="M85 80 C85 65, 115 65, 115 80" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M90 85 C90 75, 110 75, 110 85" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M95 90 C95 83, 105 83, 105 90" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="100" cy="92" r="2" fill={color} />

    {/* App list lines on screen */}
    <line x1="78" y1="105" x2="108" y2="105" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <line x1="78" y1="112" x2="118" y2="112" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <line x1="78" y1="119" x2="100" y2="119" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <line x1="78" y1="126" x2="114" y2="126" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />

    {/* Sync arrows */}
    <path d="M150 85 C158 80, 162 88, 155 92" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <polygon points="155,89 155,95 160,92" fill={color} opacity="0.5" />
    <path d="M150 100 C142 105, 138 97, 145 93" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <polygon points="145,96 145,90 140,93" fill={color} opacity="0.5" />
  </svg>
);

/** Needle + thread sewing stitch pattern — hero illustration */
export const HeroStitchIllustration: React.FC<IllustrationProps> = ({
  className = '',
  color = '#111111',
}) => (
  <svg
    viewBox="0 0 400 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Stitch line — dashed to look like a real basting stitch */}
    <path
      d="M10 60 C50 20, 90 100, 130 60 C170 20, 210 100, 250 60 C290 20, 330 100, 370 60"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="12 8"
      fill="none"
      opacity="0.3"
    />

    {/* Solid thread trailing the needle */}
    <path
      d="M10 60 C50 20, 90 100, 130 60 C170 20, 210 100, 250 60"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
      opacity="0.15"
    />

    {/* Needle at the end */}
    <line x1="370" y1="60" x2="395" y2="45" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="392" cy="47" r="2.5" stroke={color} strokeWidth="1" fill="none" />
  </svg>
);

