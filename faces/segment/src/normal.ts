import ui from '@zos/ui'
import { Step, Time } from '@zos/sensor'
import {
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
import { centred, numberBox, PAD, track, type Language } from './common.ts'
import { layout as L } from './layout.ts'
import { imageRow } from './rows.ts'

const NORMAL = ui.show_level.ONLY_NORMAL

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

function buildTapZones(): void {
  const blank = 'images/misc/blank.png'
  createTapZone({ box: { x: 330, y: 330, w: 90, h: 60 }, type: ui.data_type.HEART, src: blank })
  createTapZone({ box: { x: 180, y: 325, w: 120, h: 90 }, type: ui.data_type.STEP, src: blank })
  createTapZone({ box: { x: 65, y: 325, w: 95, h: 65 }, type: ui.data_type.CAL, src: blank })
  createTapZone({ box: { x: 85, y: 55, w: 75, h: 55 }, type: ui.data_type.WEATHER_CURRENT, src: blank })
  createTapZone({ box: { x: 320, y: 55, w: 75, h: 55 }, type: ui.data_type.WEATHER_CURRENT, src: blank })
  createTapZone({ box: { x: 0, y: 215, w: 45, h: 55 }, type: ui.data_type.ALARM_CLOCK, src: blank })
}

/**
 * SEGMENT's whole normal screen: clock with seconds, data, the steps row and tap zones.
 * Shared with SEGUE. Returns a release function for the sensor listeners.
 */
export function buildNormalScreen(lang: Language): () => void {
  const { normal, seconds } = L.time
  createSegmentClock([{
    digitsDir: 'images/time/normal',
    x: normal.x,
    y: normal.y,
    space: normal.space,
    showLevel: NORMAL,
    seconds: { digitsDir: 'images/time/seconds', x: seconds.x, y: seconds.y, space: seconds.space },
  }])
  buildNormal(lang)
  buildTapZones()

  const steps = new Step()
  const row = imageRow(L.steps.cx, Math.round(L.steps.y - PAD), 0, NORMAL)
  const update = () => row(String(steps.getCurrent()).split('').map(d => `images/font/steps/${d}.png`))
  update()
  steps.onChange(update)
  // onChange alone left yesterday's count after a midnight spent in AOD:
  // re-read on return to the face and once a minute.
  new Time().onPerMinute(update)
  if (ui.widget.WIDGET_DELEGATE !== undefined) ui.createWidget(ui.widget.WIDGET_DELEGATE, { resume_call: update })
  return () => steps.offChange(update)
}
