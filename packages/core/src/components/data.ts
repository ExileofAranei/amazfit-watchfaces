import ui from '@zos/ui'
import { px } from '@zos/utils'

/** 0.png … 9.png inside `dir` */
export const digitArray = (dir: string): string[] => Array.from({ length: 10 }, (_, i) => `${dir}/${i}.png`)
const range = (dir: string, n: number, from = 0): string[] => Array.from({ length: n }, (_, i) => `${dir}/${i + from}.png`)

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export type Align = 'left' | 'center' | 'right'
const alignOf = (a: Align = 'center'): number =>
  a === 'left' ? ui.align.LEFT : a === 'right' ? ui.align.RIGHT : ui.align.CENTER_H

/** A system value drawn with an image font (TEXT_IMG). */
export interface NumberOptions {
  box: Box
  /** ui.data_type.* */
  type: number
  /** Folder with 0–9 images; may also hold the optional images below */
  font: string
  unit?: string
  negative?: string
  dot?: string
  invalid?: string
  space?: number
  align?: Align
  showLevel: number
}

export function createNumber(o: NumberOptions): void {
  ui.createWidget(ui.widget.TEXT_IMG, {
    x: px(o.box.x),
    y: px(o.box.y),
    w: px(o.box.w),
    h: px(o.box.h),
    type: o.type,
    font_array: digitArray(o.font),
    h_space: px(o.space ?? 0),
    align_h: alignOf(o.align),
    ...(o.unit ? { unit_en: o.unit, unit_sc: o.unit, unit_tc: o.unit } : {}),
    ...(o.negative ? { negative_image: o.negative } : {}),
    ...(o.dot ? { dot_image: o.dot } : {}),
    ...(o.invalid ? { invalid_image: o.invalid } : {}),
    show_level: o.showLevel,
  })
}

export function createImage(o: { x: number; y: number; src: string; showLevel: number }): void {
  ui.createWidget(ui.widget.IMG, { x: px(o.x), y: px(o.y), src: o.src, show_level: o.showLevel })
}

/** Icon visible only while a system status is on (e.g. alarm set). */
export function createStatusIcon(o: { x: number; y: number; src: string; status: number; showLevel: number }): void {
  ui.createWidget(ui.widget.IMG_STATUS, { x: px(o.x), y: px(o.y), type: o.status, src: o.src, show_level: o.showLevel })
}

/** Weather condition icon: 29 images 0.png … 28.png (docs: watchface/specification). */
export function createWeatherIcon(o: { x: number; y: number; dir: string; showLevel: number }): void {
  const images = range(o.dir, 29)
  ui.createWidget(ui.widget.IMG_LEVEL, {
    x: px(o.x),
    y: px(o.y),
    image_array: images,
    image_length: images.length,
    type: ui.data_type.WEATHER,
    show_level: o.showLevel,
  })
}

/** Weekday name: 7 images 1.png … 7.png (Mon…Sun), same set for every language slot. */
export function createWeekday(o: { x: number; y: number; dir: string; showLevel: number }): void {
  const week = range(o.dir, 7, 1)
  ui.createWidget(ui.widget.IMG_WEEK, { x: px(o.x), y: px(o.y), week_en: week, week_sc: week, week_tc: week, show_level: o.showLevel })
}

/** Month as a word: 12 images 1.png … 12.png. */
export function createMonthName(o: { x: number; y: number; dir: string; showLevel: number }): void {
  const months = range(o.dir, 12, 1)
  ui.createWidget(ui.widget.IMG_DATE, {
    month_startX: px(o.x),
    month_startY: px(o.y),
    month_is_character: true,
    month_en_array: months,
    month_sc_array: months,
    month_tc_array: months,
    show_level: o.showLevel,
  })
}

/** Day of month with an image font, zero-padded to 2 digits so a fixed x keeps it centred. */
export function createDay(o: { x: number; y: number; font: string; space?: number; showLevel: number }): void {
  const digits = digitArray(o.font)
  ui.createWidget(ui.widget.IMG_DATE, {
    day_startX: px(o.x),
    day_startY: px(o.y),
    day_zero: 1,
    day_space: px(o.space ?? 0),
    day_en_array: digits,
    day_sc_array: digits,
    day_tc_array: digits,
    show_level: o.showLevel,
  })
}

/** Invisible tap zone that opens the system app for a data_type. */
export function createTapZone(o: { box: Box; type: number; src: string }): void {
  ui.createWidget(ui.widget.IMG_CLICK, {
    x: px(o.box.x),
    y: px(o.box.y),
    w: px(o.box.w),
    h: px(o.box.h),
    src: o.src,
    type: o.type,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}
