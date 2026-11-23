export type Language = 'ru' | 'en'
/** Text images carry 1 px of padding above the caps (see face-config.ts). */
export const PAD = 1
export const centred = (cx: number, w: number): number => cx - w / 2
export const numberBox = (cx: number, capTop: number, cap: number, w: number) => ({
  x: centred(cx, w),
  y: capTop - PAD,
  w,
  h: cap + 2 * PAD,
})

/** Tracking in px for a cap height, from font units (UPM 1000, cap 720). */
export const track = (units: number, cap: number): number => (units * cap) / 720
