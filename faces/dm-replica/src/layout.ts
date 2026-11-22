/**
 * Prototype layout in 480×480 design pixels. Final coordinates come from the designer's mockup (brief 001).
 * Digit art: 186×295 (geometry fitted to the DM reference, IoU 0.96), colon 70×295 (38 + 16 px padding each side).
 */
export const layout = {
  time: {
    normal: { height: 110, x: 52, y: 185, space: 6 },
    seconds: { height: 48, x: 386, y: 247, space: 3 },
    aod: { height: 88, x: 106, y: 196, space: 5 },
  },
} as const
