import ui, { getImageInfo, prop, deleteWidget } from '@zos/ui'
import { getLanguage } from '@zos/settings'
import { Step, Time } from '@zos/sensor'
import {
  createBackground,
  createDay,
  createImage,
  createMonthName,
  createNumber,
  createSegmentClock,
  createStatusIcon,
  createTapZone,
  createWeatherIcon,
  createWeekday,
} from '@wf/core'
import { layout as L } from './layout.ts'

type Language = 'ru' | 'en'
const RUSSIAN_LANGUAGE_CODE = 4
const NORMAL = ui.show_level.ONLY_NORMAL
const AOD = ui.show_level.ONAL_AOD

/** Text images carry 1 px of padding above the caps (see face-config.ts). */
const PAD = 1
const centred = (cx: number, w: number): number => cx - w / 2
const numberBox = (cx: number, capTop: number, cap: number, w: number) => ({
  x: centred(cx, w),
  y: capTop - PAD,
  w,
  h: cap + 2 * PAD,
})

/** Tracking in px for a cap height, from font units (UPM 1000, cap 720). */
const track = (units: number, cap: number): number => (units * cap) / 720

function buildNormal(lang: Language): void {
  const W = 'images/font/white'

  createMonthName({ x: centred(L.month.cx, L.month.boxW), y: L.month.y - PAD, dir: `images/text/${lang}/month`, showLevel: NORMAL })
  createDay({ x: L.day.cx - 41.4, y: L.day.y - PAD, font: 'images/font/date', space: track(-20, L.day.cap), showLevel: NORMAL })
  createNumber({
    box: numberBox(L.temperature.cx, L.temperature.y, L.temperature.cap, L.temperature.w),
    type: ui.data_type.WEATHER_CURRENT,
    font: W,
    negative: `${W}/minus.png`,
    unit: `${W}/degree.png`,
    space: track(0, L.temperature.cap),
    showLevel: NORMAL,
  })
  createWeatherIcon({ x: L.weather.x, y: L.weather.y, dir: 'images/weather', showLevel: NORMAL })
  createWeekday({ x: centred(L.weekday.cx, L.weekday.boxW), y: L.weekday.y - PAD, dir: `images/text/${lang}/weekday`, showLevel: NORMAL })

  createImage({ x: L.bolt.x, y: L.bolt.y, src: 'images/icons/bolt.png', showLevel: NORMAL })
  createNumber({
    box: numberBox(L.battery.cx, L.battery.y, L.battery.cap, L.battery.w),
    type: ui.data_type.BATTERY,
    font: W,
    unit: `${W}/percent.png`,
    space: track(0, L.battery.cap),
    showLevel: NORMAL,
  })
  createStatusIcon({ x: L.alarm.x, y: L.alarm.y, src: 'images/icons/alarm.png', status: ui.system_status.CLOCK, showLevel: NORMAL })

  const ic = L.icons
  createImage({ x: ic.flame.x, y: ic.flame.y, src: 'images/icons/flame.png', showLevel: NORMAL })
  createImage({ x: ic.steps.x, y: ic.steps.y, src: 'images/icons/steps.png', showLevel: NORMAL })
  createImage({ x: ic.heart.x, y: ic.heart.y, src: 'images/icons/heart.png', showLevel: NORMAL })

  createNumber({ box: numberBox(L.calories.cx, L.calories.y, L.calories.cap, L.calories.w), type: ui.data_type.CAL, font: W, space: track(0, L.calories.cap), showLevel: NORMAL })
  createNumber({ box: numberBox(L.heart.cx, L.heart.y, L.heart.cap, L.heart.w), type: ui.data_type.HEART, font: W, space: track(0, L.heart.cap), showLevel: NORMAL })
  createNumber({
    box: numberBox(L.distance.cx, L.distance.y, L.distance.cap, L.distance.w),
    type: ui.data_type.DISTANCE,
    font: W,
    dot: `${W}/dot.png`,
    unit: `images/text/${lang}/km.png`,
    space: track(0, L.distance.cap),
    showLevel: NORMAL,
  })
}

// Keep the original lower slot's saved Off and Steps choices across upgrades.
const aodChoices = [
  { type: 100001, metric: 'off', ru: 'Выкл.', en: 'Off' },
  { type: 100002, metric: 'steps', ru: 'Шаги', en: 'Steps' },
  { type: 100003, metric: 'heart', ru: 'Пульс', en: 'Heart rate' },
  { type: 100004, metric: 'battery', ru: 'Заряд', en: 'Battery' },
] as const

function buildAodSlots(lang: Language) {
  const stepRows: ReturnType<typeof imageRow>[] = []
  const dir = 'images/edit'
  const font = 'images/aod/font/metric'
  const options = aodChoices.map(choice => ({
    type: choice.type, preview: `${dir}/${choice.metric}.png`,
    title_en: choice[lang], title_sc: choice.en, title_tc: choice.en,
  }))
  for (const slot of L.aod.slots) {
    const group = ui.createWidget(ui.widget.WATCHFACE_EDIT_GROUP, {
      edit_id: slot.editId, x: 160, y: slot.y - 16, w: 160, h: 48,
      select_image: `${dir}/selected.png`, un_select_image: `${dir}/frame.png`,
      tips_BG: `${dir}/tip.png`, tips_x: -22, tips_y: slot.tipOffset, tips_width: 204,
      default_type: aodChoices[0].type, optional_types: options, count: options.length,
    })
    const type = group.getProperty(prop.CURRENT_TYPE)
    const choice = aodChoices.find(option => option.type === type)
    if (choice?.metric === 'steps') {
      stepRows.push(imageRow(240, slot.y - PAD, 0, AOD))
    } else if (choice?.metric === 'heart' || choice?.metric === 'battery') {
      const battery = choice.metric === 'battery'
      createNumber({
        box: numberBox(240, slot.y, L.aod.cap, 120), font,
        type: battery ? ui.data_type.BATTERY : ui.data_type.HEART,
        unit: battery ? `${font}/percent.png` : undefined,
        invalid: `${font}/minus.png`, showLevel: AOD,
      })
    }
  }
  return stepRows
}

/** Position each image using its own advance, including the narrow Orbitron one. */
function imageRow(cx: number, y: number, gap: number, level: number) {
  const widgets: ReturnType<typeof ui.createWidget>[] = []
  const widths = new Map<string, number>()
  return (paths: string[]) => {
    const advances = paths.map(path => {
      if (!widths.has(path)) widths.set(path, getImageInfo(path).width)
      return widths.get(path)!
    })
    const width = advances.reduce((sum, w) => sum + w, 0) + gap * (paths.length - 1)
    let x = Math.round(cx - width / 2)
    paths.forEach((src, i) => {
      if (widgets[i]) widgets[i].setProperty(prop.MORE, { x, y, src })
      else widgets.push(ui.createWidget(ui.widget.IMG, { x, y, src, show_level: level }))
      x += advances[i] + gap
    })
    while (widgets.length > paths.length) deleteWidget(widgets.pop()!)
  }
}

function buildLiveRows(stepRows: ReturnType<typeof imageRow>[]) {
  const steps = new Step()
  const normal = imageRow(L.steps.cx, Math.round(L.steps.y - PAD), 0, NORMAL)
  const updateSteps = () => {
    const digits = String(steps.getCurrent()).split('')
    normal(digits.map(d => `images/font/steps/${d}.png`))
    for (const row of stepRows) row(digits.map(d => `images/aod/font/steps/${d}.png`))
  }
  const time = new Time()
  updateSteps()
  steps.onChange(updateSteps)
  // onChange alone left yesterday's count on the normal screen after a midnight spent in AOD:
  // re-read on return to the face and once a minute.
  time.onPerMinute(updateSteps)
  if (ui.widget.WIDGET_DELEGATE !== undefined) ui.createWidget(ui.widget.WIDGET_DELEGATE, { resume_call: updateSteps })
  return () => {
    steps.offChange(updateSteps)
  }
}

let releaseRows: (() => void) | undefined

function buildTapZones(): void {
  const blank = 'images/misc/blank.png'
  createTapZone({ box: { x: 330, y: 330, w: 90, h: 60 }, type: ui.data_type.HEART, src: blank })
  createTapZone({ box: { x: 180, y: 325, w: 120, h: 90 }, type: ui.data_type.STEP, src: blank })
  createTapZone({ box: { x: 65, y: 325, w: 95, h: 65 }, type: ui.data_type.CAL, src: blank })
  createTapZone({ box: { x: 85, y: 55, w: 75, h: 55 }, type: ui.data_type.WEATHER_CURRENT, src: blank })
  createTapZone({ box: { x: 320, y: 55, w: 75, h: 55 }, type: ui.data_type.WEATHER_CURRENT, src: blank })
  createTapZone({ box: { x: 0, y: 215, w: 45, h: 55 }, type: ui.data_type.ALARM_CLOCK, src: blank })
}

WatchFace({
  build() {
    createBackground()
    const { normal, seconds, aod } = L.time
    createSegmentClock([
      {
        digitsDir: 'images/time/normal',
        x: normal.x,
        y: normal.y,
        space: normal.space,
        showLevel: NORMAL,
        seconds: { digitsDir: 'images/time/seconds', x: seconds.x, y: seconds.y, space: seconds.space },
      },
      { digitsDir: 'images/time/aod', x: aod.x, y: aod.y, space: aod.space, showLevel: AOD | ui.show_level.ONLY_EDIT },
    ])
    const lang = getLanguage() === RUSSIAN_LANGUAGE_CODE ? 'ru' : 'en'
    buildNormal(lang)
    releaseRows = buildLiveRows(buildAodSlots(lang))
    buildTapZones()
  },
  onDestroy() { releaseRows?.() },
})
