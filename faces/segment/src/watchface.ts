import ui from '@zos/ui'
import { getLanguage } from '@zos/settings'
import { Step, Time } from '@zos/sensor'
import { createBackground, createImage, createNumber, createSegmentClock, createWeekday } from '@wf/core'
import { centred, numberBox, PAD, track, type Language } from './common.ts'
import { layout as L } from './layout.ts'
import { buildNormalScreen } from './normal.ts'
import { imageRow } from './rows.ts'

const RUSSIAN_LANGUAGE_CODE = 4
const AOD = ui.show_level.ONAL_AOD

function buildAod(lang: Language): void {
  const A = L.aod
  createWeekday({ x: centred(A.weekday.cx, A.weekday.boxW), y: A.weekday.y - PAD, dir: `images/aod/text/${lang}/weekday`, showLevel: AOD })

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

function buildAodRows(lang: Language): () => void {
  const steps = new Step()
  const stepsRow = imageRow(L.aod.steps.cx, L.aod.steps.y - PAD, 0, AOD)
  const updateSteps = () => stepsRow(String(steps.getCurrent()).split('').map(d => `images/aod/font/steps/${d}.png`))
  const time = new Time()
  const date = imageRow(L.aod.date.cx, L.aod.date.y - PAD, 6, AOD)
  const updateDate = () => {
    const day = String(time.getDate())
    const dayLabel = lang === 'ru' ? day.padStart(2, '0') : day
    const dayImage = `images/aod/font/date/${dayLabel}.png`
    const monthImage = `images/aod/text/${lang}/month/${time.getMonth()}.png`
    date(lang === 'ru' ? [dayImage, monthImage] : [monthImage, dayImage])
  }
  updateDate()
  updateSteps()
  time.onPerDay(updateDate)
  steps.onChange(updateSteps)
  time.onPerMinute(updateSteps)
  return () => steps.offChange(updateSteps)
}

let releases: (() => void)[] = []

WatchFace({
  build() {
    createBackground()
    const lang = getLanguage() === RUSSIAN_LANGUAGE_CODE ? 'ru' : 'en'
    const { aod } = L.time
    createSegmentClock([{ digitsDir: 'images/time/aod', x: aod.x, y: aod.y, space: aod.space, showLevel: AOD }])
    buildAod(lang)
    releases = [buildNormalScreen(lang), buildAodRows(lang)]
  },
  onDestroy() { releases.forEach(release => release()) },
})
