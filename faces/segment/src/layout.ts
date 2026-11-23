/**
 * Layout in 480×480 design px, measured from the DM reference screenshot (dial circle fitted, scale 0.825).
 * Boxes are ink bounds of the original; text widgets are centred on `cx`.
 * Digit art: 186×295 (geometry fitted to the reference), colon 78×295.
 */
export const layout = {
  time: {
    normal: { height: 108, x: 49.3, y: 187.5, space: 6.5 },
    seconds: { height: 47.4, x: 390.8, y: 246.9, space: 7.3 },
    /** Thin AOD segments (art/time/aod): 4 × 66.8 + colon 28 + 4 × 6 = 319 px wide, centred on x = 240.
     * y centres the row between the weekday (bottom 112) and the steps (top 404). 106 px keeps 08:08 within the AOD limit. */
    aod: { height: 106, x: 80.4, y: 205, space: 6 },
  },
  month: { cx: 241.5, y: 31.6, cap: 16.5, boxW: 220 },
  weekday: { cx: 241.5, y: 131.4, cap: 16.5, boxW: 260 },
  day: { cx: 241.9, y: 70.3, cap: 38 },
  temperature: { cx: 121, y: 78.6, cap: 19.8, w: 90 },
  weather: { x: 329.4, y: 61.3, h: 44.6 },
  battery: { cx: 424.3, y: 204, cap: 19.8, w: 90 },
  bolt: { x: 407.8, y: 181.7, h: 17.3 },
  alarm: { x: 11.7, y: 228.7, h: 25.6 },
  icons: {
    flame: { x: 101.7, y: 332.7, h: 19 },
    steps: { x: 229.5, y: 331, h: 25.6 },
    heart: { x: 360.7, y: 334.3, h: 19 },
  },
  calories: { cx: 109.9, y: 363.2, cap: 19.8, w: 110 },
  heart: { cx: 373.1, y: 363.2, cap: 19.8, w: 90 },
  steps: { cx: 240.7, y: 380.5, cap: 27.2, w: 160 },
  distance: { cx: 243.6, y: 434.2, cap: 19.8, w: 140 },
  aod: {
    date: { cx: 240, y: 69, cap: 17, boxW: 200 },
    weekday: { cx: 240, y: 99, cap: 13, boxW: 200 },
    /** Only steps remain below the time: no icon, number centred */
    steps: { cx: 240, y: 404, cap: 16 },
    battery: { cx: 249, y: 447, cap: 12, w: 80 },
    bolt: { x: 212.6, y: 446, h: 14 },
  },
  colors: { white: '#F6F5FC', red: '#E04B33', aod: '#B9B9BE' },
} as const
