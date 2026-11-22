/**
 * Minimal hand-written declarations for the Zepp OS device APIs used by our watchfaces.
 *
 * Why not @zeppos/device-types: v4.0.0 lacks IMG_TIME, IMG_WEEK, IMG_DATE, IMG_STATUS, IMG_CLICK,
 * show_level and several data_type members. Every name below is taken from docs.zepp.com
 * (zepp-health/zeppos-docs) or from the official sample zeppos-samples/watchface/3.0/timer.
 * Add members only together with a docs reference.
 */

/** docs: watchface/api/hmUI/widget/* ; sample 3.0/timer */
declare module '@zos/ui' {
  type WidgetType = number & { readonly __widget: unique symbol }

  interface Widget {
    setProperty(prop: number, value: unknown): void
    getProperty(prop: number): unknown
  }

  /** docs: watchface/api/hmUI/createWidget — `show_level` values (combinable with `|`) */
  const show_level: {
    readonly ONLY_NORMAL: number
    readonly ONAL_AOD: number
    readonly ONLY_EDIT: number
  }

  const align: {
    readonly LEFT: number
    readonly RIGHT: number
    readonly CENTER_H: number
    readonly CENTER_V: number
    readonly TOP: number
    readonly BOTTOM: number
  }

  const widget: {
    readonly IMG: WidgetType
    readonly FILL_RECT: WidgetType
    readonly TEXT: WidgetType
    readonly IMG_TIME: WidgetType
  }

  interface BaseOptions {
    show_level?: number
  }

  interface FillRectOptions extends BaseOptions {
    x: number
    y: number
    w: number
    h: number
    color: number
  }

  interface ImgOptions extends BaseOptions {
    x: number
    y: number
    w?: number
    h?: number
    src: string
  }

  /** docs: watchface/api/hmUI/widget/IMG_TIME (prefixes hour_/minute_/second_) */
  interface ImgTimeOptions extends BaseOptions {
    hour_zero?: 0 | 1
    hour_startX?: number
    hour_startY?: number
    hour_array?: string[]
    hour_space?: number
    hour_align?: number
    hour_unit_sc?: string
    hour_unit_tc?: string
    hour_unit_en?: string
    minute_zero?: 0 | 1
    minute_startX?: number
    minute_startY?: number
    minute_array?: string[]
    minute_space?: number
    minute_follow?: 0 | 1
    minute_align?: number
    minute_unit_sc?: string
    minute_unit_tc?: string
    minute_unit_en?: string
    second_zero?: 0 | 1
    second_startX?: number
    second_startY?: number
    second_array?: string[]
    second_space?: number
    second_follow?: 0 | 1
    second_align?: number
  }

  function createWidget(type: WidgetType, options: FillRectOptions | ImgOptions | ImgTimeOptions): Widget

  const ui: {
    createWidget: typeof createWidget
    widget: typeof widget
    show_level: typeof show_level
    align: typeof align
  }
  export default ui
}

/** docs: reference/device-app-api/newAPI/utils/px ; log */
declare module '@zos/utils' {
  function px(value: number): number
  const log: {
    getLogger(name: string): { log(...args: unknown[]): void; error(...args: unknown[]): void }
  }
}

/** docs: reference/device-app-api/newAPI/app/getScene */
declare module '@zos/app' {
  const SCENE_AOD: number
  const SCENE_WATCHFACE: number
  function getScene(): number
}

/** docs: reference/device-app-api/newAPI/settings/getLanguage ; related-resources/language-list (ru-RU = 4) */
declare module '@zos/settings' {
  function getLanguage(): number
}

/** Framework globals. docs: watchface quick start (WatchFace), reference/app (App) */
declare function WatchFace(option: {
  onInit?(): void
  build?(): void
  onDestroy?(): void
}): void

declare function App(option: {
  globalData?: Record<string, unknown>
  onCreate?(): void
  onDestroy?(): void
}): void
