/**
 * Hand-drawn-style line illustrations: ink strokes over a highlighter blob.
 * Colours come from CSS variables so they follow the theme.
 * They are decorative, so they are hidden from screen readers.
 */

const ink = {
  fill: 'none',
  stroke: 'var(--ink)',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
const paper = { ...ink, fill: 'var(--paper)' };
const marker = { fill: 'var(--highlight)', opacity: 0.7 };

function Svg({ viewBox, className = '', children }) {
  return (
    <svg viewBox={viewBox} className={`illo ${className}`} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** Desk with an open notebook, pencil, mug and plant — used on the sign-in screens. */
export function DeskIllustration(props) {
  return (
    <Svg viewBox="0 0 360 300" {...props}>
      <path {...marker} d="M74 122c22-42 94-62 164-50s102 40 92 88-52 80-132 82S40 214 48 172s6-30 26-50z" />

      {/* sticky note */}
      <g transform="rotate(8 262 86)">
        <rect x="240" y="62" width="48" height="46" rx="2" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.8" />
        <path {...ink} d="M249 78h28M249 88h20M249 98h24" />
      </g>

      {/* notebook */}
      <path {...paper} d="M80 150c30 2 62 4 92 8v82c-32-4-66-6-100-6z" />
      <path {...paper} d="M172 158c30-4 62-8 96-10l6 84c-34 0-68 4-102 8z" />
      <path {...ink} d="M172 158v82" />
      <rect {...ink} x="88" y="166" width="10" height="10" rx="1.5" />
      <rect {...ink} x="88" y="186" width="10" height="10" rx="1.5" />
      <rect {...ink} x="87" y="206" width="10" height="10" rx="1.5" />
      <path {...ink} stroke="var(--done)" strokeWidth="2.2" d="M90 171l3 3 6-7M90 191l3 3 6-7" />
      <path {...ink} d="M106 171h46M106 191h38M105 211h50" />
      <path {...ink} d="M188 176c20-2 40-4 64-5M188 192c22-2 44-4 66-5M188 208c14-1 28-2 40-3" />

      {/* pencil */}
      <path d="M200 226l68-28 5 11-68 28z" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.8" strokeLinejoin="round" />
      <path {...paper} d="M200 226l-14 13 19-2z" />
      <path {...ink} d="M262 201l5 11" />

      {/* mug */}
      <path {...paper} d="M290 200h40v38c0 9-7 13-20 13s-20-4-20-13z" />
      <path {...ink} d="M330 210c13 0 13 22 0 22" />
      <path {...ink} d="M302 188c-6-8 6-12 0-20M316 188c-6-8 6-12 0-20" />

      {/* plant */}
      <path {...ink} d="M47 214c0-18-2-32 2-50" />
      <path {...paper} d="M48 192c-14-2-22-12-22-22 12 0 22 8 22 22z" />
      <path {...paper} d="M49 176c10-4 20-14 18-26-12 2-20 12-18 26z" />
      <path {...paper} d="M47 205c8-2 16-6 18-14-10 0-16 6-18 14z" />
      <path {...paper} d="M30 214h34l-4 36H34z" />

      <path {...ink} d="M16 251c60-2 120 1 180-1s100 1 148 0" />
    </Svg>
  );
}

/** Clipboard with unticked boxes and a paper plane — no tasks yet. */
export function ChecklistIllustration(props) {
  return (
    <Svg viewBox="0 0 240 180" {...props}>
      <path {...marker} d="M50 100c4-40 50-66 100-58s70 40 60 72-52 50-100 44S46 136 50 100z" />
      <rect {...paper} x="80" y="36" width="84" height="112" rx="6" />
      <rect {...paper} x="106" y="28" width="32" height="14" rx="4" />
      {[62, 86, 110].map((y) => (
        <g key={y}>
          <rect {...ink} x="94" y={y} width="10" height="10" rx="1.5" />
          <path {...ink} strokeDasharray="4 5" d={`M112 ${y + 5}h38`} />
        </g>
      ))}
      <path {...ink} strokeDasharray="3 6" d="M150 74c12-12 22-18 34-24" />
      <path {...paper} d="M178 44l40-14-14 38-8-16z" />
      <path {...ink} d="M196 52l22-22" />
    </Svg>
  );
}

/** Stack of books with an apple on top — no courses yet. */
export function BooksIllustration(props) {
  return (
    <Svg viewBox="0 0 240 180" {...props}>
      <path {...marker} d="M44 104c6-44 56-70 104-62s68 44 58 76-56 46-104 40S40 138 44 104z" />
      <rect {...paper} x="62" y="118" width="116" height="22" rx="3" />
      <path {...ink} d="M80 118v22M160 118v22" />
      <rect {...paper} x="76" y="96" width="94" height="22" rx="3" />
      <path {...ink} d="M92 102h40M92 111h24" />
      <rect {...paper} x="68" y="74" width="102" height="22" rx="3" />
      <path {...ink} d="M84 74v22" />
      <path d="M148 96v18l5-4 5 4V96" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.8" strokeLinejoin="round" />
      <circle {...paper} cx="120" cy="62" r="11" />
      <path {...ink} d="M120 51c0-4 2-7 5-8" />
      <path {...paper} d="M122 48c4-6 10-6 13-4-3 5-8 6-13 4z" />
      <path {...ink} d="M36 141c56-1 112 1 168-1" />
    </Svg>
  );
}

/** A sprout in a pot under a sun — everything is done. */
export function SproutIllustration(props) {
  return (
    <Svg viewBox="0 0 240 180" {...props}>
      <circle cx="166" cy="54" r="22" fill="var(--highlight)" opacity="0.8" />
      <path {...ink} d="M166 20v-8M196 54h8M188 32l6-6M144 32l-6-6M188 76l6 6" />
      <path {...ink} d="M120 116V82" />
      <path {...paper} d="M120 98c-16 0-24-10-24-22 14 0 24 10 24 22z" />
      <path {...paper} d="M120 88c14 0 22-10 22-20-12 0-22 8-22 20z" />
      <path {...paper} d="M98 116h44l-6 34h-32z" />
      <path {...ink} d="M50 151c48-1 96 1 140-1" />
    </Svg>
  );
}

/** Folded map with a dashed route that ends in an X — page not found. */
export function MapIllustration(props) {
  return (
    <Svg viewBox="0 0 240 180" {...props}>
      <path {...marker} d="M40 98c6-46 60-72 112-62s66 46 54 78-58 48-108 40S36 130 40 98z" />
      <path {...paper} d="M44 52l48-12 52 12 48-12v98l-48 12-52-12-48 12z" />
      <path {...ink} d="M92 40v98M144 52v98" />
      <path {...ink} strokeDasharray="5 6" d="M58 126c20-10 28-38 54-30s34-30 62-40" />
      <circle {...ink} cx="58" cy="126" r="3" />
      <path fill="none" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" d="M174 48l12 12M186 48l-12 12" />
    </Svg>
  );
}
