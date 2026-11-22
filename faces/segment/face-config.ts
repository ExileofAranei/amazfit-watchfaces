import { defineFace, type TextSet, type TextStyle } from '@wf/tooling'
import { layout } from './src/layout.ts'

const ORBITRON = '../../fonts/orbitron/orbitron-vf.ttf'
const CYR = '../../fonts/segment-cyr/glyphs-750'
const { white, red, aod: grey } = layout.colors
const t = layout.time

/**
 * scaleX: DM's text is ~4–7 % narrower than Orbitron VF at the same cap height (measured against the
 * reference; likely an older static Orbitron cut). Per-group factors keep widths within ~1 px.
 */
const style = (wght: number, cap: number, color: string, tracking = 0, scaleX = 1): TextStyle => ({
  font: ORBITRON,
  wght,
  cap,
  color,
  tracking,
  scaleX,
  extraGlyphs: CYR,
})
const SX = { label: 0.935, date: 0.96, metric: 0.958, steps: 0.946 }

const RU_MONTHS = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ']
const RU_MONTHS_GEN = ['ЯНВАРЯ', 'ФЕВРАЛЯ', 'МАРТА', 'АПРЕЛЯ', 'МАЯ', 'ИЮНЯ', 'ИЮЛЯ', 'АВГУСТА', 'СЕНТЯБРЯ', 'ОКТЯБРЯ', 'НОЯБРЯ', 'ДЕКАБРЯ']
const RU_WEEKDAYS = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ']

const EN_MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
const EN_WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const locales = [
  { lang: 'ru', months: RU_MONTHS, dateMonths: RU_MONTHS_GEN, weekdays: RU_WEEKDAYS, km: 'КМ' },
  { lang: 'en', months: EN_MONTHS, dateMonths: EN_MONTHS, weekdays: EN_WEEKDAYS, km: 'km' },
]

const numbered = (words: string[]): Record<string, string> => Object.fromEntries(words.map((w, i) => [String(i + 1), w]))
const digits = (extra: Record<string, string> = {}): Record<string, string> => ({
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i), String(i)])),
  ...extra,
})

/** Digit font folders: 0–9 + named symbols used as unit / negative / dot images. */
const SYMBOLS = { minus: '-', dot: '.', percent: '%', degree: '°' }

// Use the displayed day as the filename, sharing days 10–31 across both locales.
const dayLabels = Array.from({ length: 31 }, (_, i) => String(i + 1))
const dateLabels = [...dayLabels, ...dayLabels.slice(0, 9).map(day => day.padStart(2, '0'))]

const texts: TextSet[] = [
  ...locales.flatMap(({ lang, months, dateMonths, weekdays, km }): TextSet[] => [
    { to: `images/text/${lang}/month`, style: style(750, layout.month.cap, white, 0, SX.label), items: numbered(months), padBottom: 3, uniformWidth: 'center', boxWidth: layout.month.boxW },
    { to: `images/text/${lang}/weekday`, style: style(750, layout.weekday.cap, white, 0, SX.label), items: numbered(weekdays), padBottom: 3, uniformWidth: 'center', boxWidth: layout.weekday.boxW },
    { to: `images/text/${lang}`, style: style(850, 10, white, 80, SX.metric), items: { km }, padTop: 10.8 },
    { to: `images/aod/text/${lang}/month`, style: style(750, layout.aod.date.cap, grey, 0, SX.label), items: numbered(dateMonths), padBottom: 3 },
    { to: `images/aod/text/${lang}/weekday`, style: style(750, layout.aod.weekday.cap, grey, 0, SX.label), items: numbered(weekdays), padBottom: 3, uniformWidth: 'center', boxWidth: layout.aod.weekday.boxW },
  ]),
  { to: 'images/font/date', style: style(400, layout.day.cap, red, -20, SX.date), items: digits() },
  { to: 'images/font/white', style: style(450, 19.8, white, 0, SX.metric), items: digits(SYMBOLS) },
  { to: 'images/font/steps', style: style(450, layout.steps.cap, red, -5, SX.steps), items: digits() },
  { to: 'images/aod/font/date', style: style(400, layout.aod.date.cap, grey, -20, SX.date), items: Object.fromEntries(dateLabels.map(day => [day, day])) },
  { to: 'images/aod/font/num', style: style(450, layout.aod.numbers.cap, grey, 0, SX.metric), items: digits(SYMBOLS) },
  { to: 'images/aod/font/small', style: style(450, layout.aod.battery.cap, grey, 0, SX.metric), items: digits(SYMBOLS) },
]

const icon = (name: string): string => `art/icons/${name}.svg`
const weatherMap: Record<string, string> = (await import('./art/icons/weather-map.json', { with: { type: 'json' } })).default
const weatherFiles = Object.fromEntries(Object.entries(weatherMap).map(([code, p]) => [code, `art/${p}`]))
const toGrey = { '#F6F5FC': grey, '#f6f5fc': grey }

/** Preview: "21:05" on black, 324×324 (Active Max watchface preview size per device list). */
const PH = 96
const dw = (h: number, vw: number) => Math.round((vw * h) / 295)
let px = 26
const previewItems = ['2', '1', 'colon', '0', '5'].map((d) => {
  const item = { svg: `art/time/normal/${d}.svg`, x: px, y: (324 - PH) / 2, height: PH }
  px += dw(PH, d === 'colon' ? 78 : 186) + 6
  return item
})

export default defineFace({
  assetsDir: 'active-max',
  assets: [
    { from: 'art/time/normal', to: 'images/time/normal', height: t.normal.height },
    { from: 'art/time/normal', to: 'images/time/seconds', height: t.seconds.height },
    { from: 'art/time/aod', to: 'images/time/aod', height: t.aod.height },
    { files: weatherFiles, to: 'images/weather', height: layout.weather.h },
    { files: { flame: icon('flame') }, to: 'images/icons', height: layout.icons.flame.h },
    { files: { heart: icon('heart') }, to: 'images/icons', height: layout.icons.heart.h },
    { files: { steps: icon('steps') }, to: 'images/icons', height: layout.icons.steps.h },
    { files: { bolt: icon('bolt') }, to: 'images/icons', height: layout.bolt.h },
    { files: { alarm: icon('alarm') }, to: 'images/icons', height: layout.alarm.h },
    { files: { flame: icon('flame'), heart: icon('heart'), steps: icon('steps') }, to: 'images/aod/icons', height: layout.aod.icons.h, recolor: toGrey },
    { files: { bolt: icon('bolt') }, to: 'images/aod/icons', height: layout.aod.bolt.h, recolor: { ...toGrey, '#F2CA56': grey, '#f2ca56': grey } },
    { files: { blank: 'art/misc/blank.svg' }, to: 'images/misc', height: 4 },
  ],
  texts,
  composites: [{ to: 'images/preview.png', width: 324, height: 324, background: '#000000', items: previewItems }],
  entries: {
    'app.js': 'src/app.ts',
    'watchface/index.js': 'src/watchface.ts',
  },
})
