import { COLS, PITCH, ROWS } from './grid.ts'

/**
 * Layout in 480×480 design px. The time is a row of dot-matrix frames on one 9 px grid:
 * HH : MM with one empty column between neighbouring frames, the colon included, so the gap
 * on either side of the colon is the same.
 */
const digitW = COLS * PITCH // 72
const colonW = 2 * PITCH // 18
const gap = PITCH // one empty column
const width = 4 * digitW + colonW + 4 * gap // 342

const hourX = (480 - width) / 2
const colonX = hourX + 2 * (digitW + gap)

export const layout = {
  time: {
    digitAdvance: digitW + gap,
    hourX,
    colonX,
    minuteX: colonX + colonW + gap,
    y: 240 - (ROWS * PITCH) / 2, // 186
    height: ROWS * PITCH, // 108
    space: gap,
  },
  /** Two editable slots above and below the time; y is the top of the visible number. */
  slots: {
    cap: 16,
    items: [
      { editId: 2, y: 38, tipOffset: 54 },
      { editId: 1, y: 426, tipOffset: -54 },
    ],
  },
  color: '#F2F2F2',
} as const
