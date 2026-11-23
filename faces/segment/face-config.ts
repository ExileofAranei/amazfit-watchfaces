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
const RU_WEEKDAYS = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ']

const EN_MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
const EN_WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const locales = [
  { lang: 'ru', months: RU_MONTHS, weekdays: RU_WEEKDAYS, km: 'КМ' },
  { lang: 'en', months: EN_MONTHS, weekdays: EN_WEEKDAYS, km: 'km' },
]

const numbered = (words: string[]): Record<string, string> => Object.fromEntries(words.map((w, i) => [String(i + 1), w]))
const digits = (extra: Record<string, string> = {}): Record<string, string> => ({
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i), String(i)])),
  ...extra,
})

/** Digit font folders: 0–9 + named symbols used as unit / negative / dot images. */
const SYMBOLS = { minus: '-', dot: '.', percent: '%', degree: '°' }

/**
 * TEXT_IMG on the watch gives every digit the slot of the widest one, so the narrow Orbitron 1 sat at the
 * left of its slot and short numbers drifted off-centre. Digits are padded to one width with the ink centred;
 * the symbols keep their own width.
 */
const tabularFont = (to: string, s: TextStyle): TextSet[] => [
  { to, style: s, items: digits(), uniformWidth: 'center' },
  { to, style: s, items: SYMBOLS },
]

const texts: TextSet[] = [
  ...locales.flatMap(({ lang, months, weekdays, km }): TextSet[] => [
    { to: `images/text/${lang}/month`, style: style(750, layout.month.cap, white, 0, SX.label), items: numbered(months), padBottom: 3, uniformWidth: 'center', boxWidth: layout.month.boxW },
    { to: `images/text/${lang}/weekday`, style: style(750, layout.weekday.cap, white, 0, SX.label), items: numbered(weekdays), padBottom: 3, uniformWidth: 'center', boxWidth: layout.weekday.boxW },
    { to: `images/text/${lang}`, style: style(850, 10, white, 80, SX.metric), items: { km }, padTop: 10.8 },
  ]),
  { to: 'images/font/date', style: style(400, layout.day.cap, red, -20, SX.date), items: digits() },
  ...tabularFont('images/font/white', style(450, 19.8, white, 0, SX.metric)),
  { to: 'images/font/steps', style: style(450, layout.steps.cap, red, -5, SX.steps), items: digits() },
  { to: 'images/aod/font/steps', style: style(450, layout.aod.steps.cap, grey, 0, SX.metric), items: digits() },
]

const icon = (name: string): string => `art/icons/${name}.svg`
const weatherMap: Record<string, string> = (await import('./art/icons/weather-map.json', { with: { type: 'json' } })).default
const weatherFiles = Object.fromEntries(Object.entries(weatherMap).map(([code, p]) => [code, `art/${p}`]))

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
    { from: 'art/edit', to: 'images/edit', height: 48 },
    { files: { blank: 'art/misc/blank.svg' }, to: 'images/misc', height: 4 },
  ],
  texts,
  composites: [
    { to: 'images/preview.png', width: 324, height: 324, background: '#000000', items: previewItems },
    { to: 'images/edit/steps.png', width: 160, height: 48, background: '#000000', items: [{ svg: icon('steps'), x: 67, y: 11, height: 26 }] },
  ],
  entries: {
    'app.js': 'src/app.ts',
    'watchface/index.js': 'src/watchface.ts',
  },
})
