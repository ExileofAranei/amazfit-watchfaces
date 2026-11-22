import ui from '@zos/ui'
import { px } from '@zos/utils'

/** One visual variant of the clock: an image set placed at a position, visible at a given show_level. */
export interface ClockLayer {
  /** Folder (relative to assets root) holding 0.png … 9.png and colon.png */
  digitsDir: string
  x: number
  y: number
  /** Gap between digits, px */
  space: number
  showLevel: number
  /** Optional seconds, drawn with their own (usually smaller) digit set */
  seconds?: { digitsDir: string; x: number; y: number; space: number }
}

const digits = (dir: string): string[] => Array.from({ length: 10 }, (_, i) => `${dir}/${i}.png`)

/**
 * 24h HH:MM clock built on IMG_TIME. Each layer is an independent widget, so the same component
 * renders the normal face and the AOD face with different assets.
 */
export function createSegmentClock(layers: ClockLayer[]): void {
  for (const layer of layers) {
    const colon = `${layer.digitsDir}/colon.png`
    ui.createWidget(ui.widget.IMG_TIME, {
      hour_zero: 1,
      hour_startX: px(layer.x),
      hour_startY: px(layer.y),
      hour_array: digits(layer.digitsDir),
      hour_space: px(layer.space),
      hour_unit_sc: colon,
      hour_unit_tc: colon,
      hour_unit_en: colon,
      minute_zero: 1,
      minute_follow: 1,
      minute_array: digits(layer.digitsDir),
      minute_space: px(layer.space),
      ...(layer.seconds
        ? {
            second_zero: 1,
            second_follow: 0,
            second_startX: px(layer.seconds.x),
            second_startY: px(layer.seconds.y),
            second_array: digits(layer.seconds.digitsDir),
            second_space: px(layer.seconds.space),
          }
        : {}),
      show_level: layer.showLevel,
    })
  }
}
