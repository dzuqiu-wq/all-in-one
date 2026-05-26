"use client";

export function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.025]"
      aria-hidden="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
