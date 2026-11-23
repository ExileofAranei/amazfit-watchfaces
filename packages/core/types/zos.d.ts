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
    readonly TEXT_IMG: WidgetType
    readonly IMG_DATE: WidgetType
    readonly IMG_WEEK: WidgetType
    readonly IMG_LEVEL: WidgetType
    readonly IMG_STATUS: WidgetType
    readonly IMG_CLICK: WidgetType
    /** docs: watchface/api/hmUI/widget/DELEGATE — may be missing on older firmware, check before use */
    readonly WIDGET_DELEGATE?: WidgetType
  }

  /** docs: watchface/api/hmUI/widget/data_type (subset we use) */
  const data_type: {
    readonly BATTERY: number
    readonly STEP: number
    readonly CAL: number
    readonly HEART: number
    readonly DISTANCE: number
    readonly WEATHER: number
    readonly WEATHER_CURRENT: number
    readonly ALARM_CLOCK: number
  }

  /** docs: watchface/api/hmUI/widget/IMG_STATUS */
  const system_status: {
    readonly CLOCK: number
    readonly DISCONNECT: number
    readonly DISTURB: number
    readonly LOCK: number
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

  /** docs: watchface/api/hmUI/widget/TEXT_IMG */
  interface TextImgOptions extends BaseOptions {
    x: number
    y: number
    w?: number
    h?: number
    font_array: string[]
    type?: number
    text?: string
    unit_sc?: string
    unit_en?: string
    unit_tc?: string
    imperial_unit_sc?: string
    imperial_unit_en?: string
    imperial_unit_tc?: string
    negative_image?: string
    dot_image?: string
    /** sample 1.0/basketball */
    invalid_image?: string
    h_space?: number
    align_h?: number
  }

  /** docs: watchface/api/hmUI/widget/IMG_DATE (prefixes year_/month_/day_) */
  interface ImgDateOptions extends BaseOptions {
    month_startX?: number
    month_startY?: number
    month_align?: number
    month_space?: number
    month_zero?: 0 | 1
    month_follow?: 0 | 1
    month_is_character?: boolean
    month_en_array?: string[]
    month_sc_array?: string[]
    month_tc_array?: string[]
    day_startX?: number
    day_startY?: number
    day_align?: number
    day_space?: number
    day_zero?: 0 | 1
    day_follow?: 0 | 1
    day_is_character?: boolean
    day_en_array?: string[]
    day_sc_array?: string[]
    day_tc_array?: string[]
  }

  /** docs: watchface/api/hmUI/widget/IMG_WEEK — w/h come from the images */
  interface ImgWeekOptions extends BaseOptions {
    x: number
    y: number
    week_en: string[]
    week_tc: string[]
    week_sc: string[]
  }

  /** docs: watchface/api/hmUI/widget/IMG_LEVEL ; `type` per sample 1.0/color-world (WEATHER) */
  interface ImgLevelOptions extends BaseOptions {
    x: number
    y: number
    w?: number
    h?: number
    image_array: string[]
    image_length: number
    type?: number
    level?: number
  }

  /** docs: watchface/api/hmUI/widget/IMG_STATUS */
  interface ImgStatusOptions extends BaseOptions {
    x: number
    y: number
    w?: number
    h?: number
    type: number
    src: string
  }

  /** docs: watchface/api/hmUI/widget/IMG_CLICK — `type` is the data_type whose app opens */
  interface ImgClickOptions extends BaseOptions {
    x: number
    y: number
    w: number
    h: number
    src: string
    type: number
  }

  /** docs: watchface/api/hmUI/widget/DELEGATE — resume_call: face launched or returned from another screen */
  interface DelegateOptions {
    resume_call?: () => void
    pause_call?: () => void
  }

  type AnyOptions =
    | DelegateOptions
    | FillRectOptions
    | ImgOptions
    | ImgTimeOptions
    | TextImgOptions
    | ImgDateOptions
    | ImgWeekOptions
    | ImgLevelOptions
    | ImgStatusOptions
    | ImgClickOptions

  function createWidget(type: WidgetType, options: AnyOptions): Widget

  const ui: {
    createWidget: typeof createWidget
    widget: typeof widget
    show_level: typeof show_level
    align: typeof align
    data_type: typeof data_type
    system_status: typeof system_status
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

/** docs: reference/device-app-api/newAPI/ui/getImageInfo, deleteWidget, widget/IMG */
declare module '@zos/ui' {
  function getImageInfo(path: string): { width: number; height: number }
  function deleteWidget(widget: ReturnType<typeof createWidget>): void
  const prop: { MORE: number }
}

/** docs: reference/device-app-api/newAPI/sensor/Step and sensor/Time */
declare module '@zos/sensor' {
  class Step {
    getCurrent(): number
    onChange(cb: () => void): void
    offChange(cb: () => void): void
  }
  class Time {
    /** docs: reference/device-app-api/newAPI/sensor/Time (API 2.0) */
    getHours(): number
    getMinutes(): number
    getDate(): number
    getMonth(): number
    onPerDay(cb: () => void): void
    /** docs: reference/device-app-api/newAPI/sensor/Time */
    onPerMinute(cb: () => void): void
  }
}
