import ui from '@zos/ui'
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

const NORMAL = ui.show_level.ONLY_NORMAL
const AOD = ui.show_level.ONAL_AOD

/** Text images carry 1 px of padding above the caps (see face.config.ts). */
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

function buildNormal(): void {
  const W = 'images/font/white'

  createMonthName({ x: centred(L.month.cx, L.month.boxW), y: L.month.y - PAD, dir: 'images/text/month', showLevel: NORMAL })
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
  createWeekday({ x: centred(L.weekday.cx, L.weekday.boxW), y: L.weekday.y - PAD, dir: 'images/text/weekday', showLevel: NORMAL })

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
  createNumber({ box: numberBox(L.steps.cx, L.steps.y, L.steps.cap, L.steps.w), type: ui.data_type.STEP, font: 'images/font/steps', space: track(-5, L.steps.cap), showLevel: NORMAL })
  createNumber({
    box: numberBox(L.distance.cx, L.distance.y, L.distance.cap, L.distance.w),
    type: ui.data_type.DISTANCE,
    font: W,
    dot: `${W}/dot.png`,
    unit: `${W}/km.png`,
    space: track(0, L.distance.cap),
    showLevel: NORMAL,
  })
}

function buildAod(): void {
  const A = L.aod
  const dayX = 141
  createDay({ x: dayX, y: A.date.y - PAD, font: 'images/aod/font/date', space: track(-20, A.date.cap), showLevel: AOD })
  createMonthName({ x: dayX + 44.6, y: A.date.y - PAD, dir: 'images/aod/text/month', showLevel: AOD })
  createWeekday({ x: centred(A.weekday.cx, A.weekday.boxW), y: A.weekday.y - PAD, dir: 'images/aod/text/weekday', showLevel: AOD })

  const I = A.icons
  createImage({ x: centred(I.flame.cx, I.flame.w), y: I.flame.y, src: 'images/aod/icons/flame.png', showLevel: AOD })
  createImage({ x: centred(I.steps.cx, I.steps.w), y: I.steps.y, src: 'images/aod/icons/steps.png', showLevel: AOD })
  createImage({ x: centred(I.heart.cx, I.heart.w), y: I.heart.y, src: 'images/aod/icons/heart.png', showLevel: AOD })

  const n = A.numbers
  const F = 'images/aod/font/num'
  const sp = track(0, n.cap)
  createNumber({ box: numberBox(n.calories, n.y, n.cap, n.w), type: ui.data_type.CAL, font: F, space: sp, showLevel: AOD })
  createNumber({ box: numberBox(n.steps, n.y, n.cap, n.w), type: ui.data_type.STEP, font: F, space: sp, showLevel: AOD })
  createNumber({ box: numberBox(n.heart, n.y, n.cap, n.w), type: ui.data_type.HEART, font: F, space: sp, showLevel: AOD })

  const S = 'images/aod/font/small'
  createImage({ x: A.bolt.x, y: A.bolt.y, src: 'images/aod/icons/bolt.png', showLevel: AOD })
  createNumber({
    box: numberBox(A.battery.cx, A.battery.y, A.battery.cap, A.battery.w),
    type: ui.data_type.BATTERY,
    font: S,
    unit: `${S}/percent.png`,
    space: track(0, A.battery.cap),
    showLevel: AOD,
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
      { digitsDir: 'images/time/aod', x: aod.x, y: aod.y, space: aod.space, showLevel: AOD },
    ])
    buildNormal()
    buildAod()
    buildTapZones()
  },
})
