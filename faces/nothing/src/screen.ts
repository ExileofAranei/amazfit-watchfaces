import ui, { getImageInfo, prop, deleteWidget } from '@zos/ui'
import { Step, Time } from '@zos/sensor'
import { createNumber, digitArray } from '@wf/core'
import { layout as L } from './layout.ts'

export type Language = 'ru' | 'en'

/** Text images carry 1 px of padding above the caps (see face-config.ts). */
const PAD = 1

const choices = [
  { type: 100001, metric: 'off', ru: 'Выкл.', en: 'Off' },
  { type: 100002, metric: 'steps', ru: 'Шаги', en: 'Steps' },
  { type: 100003, metric: 'heart', ru: 'Пульс', en: 'Heart rate' },
  { type: 100004, metric: 'battery', ru: 'Заряд', en: 'Battery' },
] as const

type Row = ReturnType<typeof imageRow>

function buildSlots(lang: Language, root: string, level: number): Row[] {
  const stepRows: Row[] = []
  const dir = `${root}/edit`
  const font = `${root}/font/metric`
  const options = choices.map(choice => ({
    type: choice.type, preview: `${dir}/${choice.metric}.png`,
    title_en: choice[lang], title_sc: choice.en, title_tc: choice.en,
  }))
  for (const slot of L.slots.items) {
    const group = ui.createWidget(ui.widget.WATCHFACE_EDIT_GROUP, {
      edit_id: slot.editId, x: 160, y: slot.y - 16, w: 160, h: 48,
      select_image: `${dir}/selected.png`, un_select_image: `${dir}/frame.png`,
      tips_BG: `${dir}/tip.png`, tips_x: -22, tips_y: slot.tipOffset, tips_width: 204,
      default_type: choices[0].type, optional_types: options, count: options.length,
    })
    const choice = choices.find(option => option.type === group.getProperty(prop.CURRENT_TYPE))
    if (choice?.metric === 'steps') {
      stepRows.push(imageRow(240, slot.y - PAD, level))
    } else if (choice?.metric === 'heart' || choice?.metric === 'battery') {
      const battery = choice.metric === 'battery'
      createNumber({
        box: { x: 180, y: slot.y - PAD, w: 120, h: L.slots.cap + 2 * PAD }, font,
        type: battery ? ui.data_type.BATTERY : ui.data_type.HEART,
        unit: battery ? `${font}/percent.png` : undefined,
        invalid: `${font}/minus.png`, showLevel: level,
      })
    }
  }
  return stepRows
}

/** A centred row of images, each placed by its own advance. */
function imageRow(cx: number, y: number, level: number) {
  const widgets: ReturnType<typeof ui.createWidget>[] = []
  const widths = new Map<string, number>()
  return (paths: string[]) => {
    const advances = paths.map(path => {
      if (!widths.has(path)) widths.set(path, getImageInfo(path).width)
      return widths.get(path)!
    })
    let x = Math.round(cx - advances.reduce((sum, w) => sum + w, 0) / 2)
    paths.forEach((src, i) => {
      if (widgets[i]) widgets[i].setProperty(prop.MORE, { x, y, src })
      else widgets.push(ui.createWidget(ui.widget.IMG, { x, y, src, show_level: level }))
      x += advances[i]
    })
    while (widgets.length > paths.length) deleteWidget(widgets.pop()!)
  }
}

/** Steps have no TEXT_IMG data type that updates in AOD, so the rows are redrawn from the sensor. */
function watchSteps(rows: Row[], root: string): () => void {
  if (rows.length === 0) return () => {}
  const steps = new Step()
  const update = () => {
    const digits = String(steps.getCurrent()).split('')
    for (const row of rows) row(digits.map(d => `${root}/font/steps/${d}.png`))
  }
  update()
  steps.onChange(update)
  // A midnight spent in AOD can leave yesterday's count: re-read every minute and on resume.
  new Time().onPerMinute(update)
  if (ui.widget.WIDGET_DELEGATE !== undefined) ui.createWidget(ui.widget.WIDGET_DELEGATE, { resume_call: update })
  return () => steps.offChange(update)
}

export interface NothingOptions {
  lang: Language
  /** Asset folder the NOTHING images were rendered to: 'images' in NOTHING, 'images/aod' in SEGUE. */
  root: string
  /** show_level for the clock and the slots; the clock is also shown in the editor. */
  level: number
}

/** The dot clock and the two slots. Shared with SEGUE. Returns a release function for the step listener. */
export function buildNothing({ lang, root, level }: NothingOptions): () => void {
  const { hourX, colonX, minuteX, y, space } = L.time
  const digits = digitArray(`${root}/time`)
  const edit = ui.show_level.ONLY_EDIT
  ui.createWidget(ui.widget.IMG_TIME, {
    hour_zero: 1, hour_startX: hourX, hour_startY: y, hour_array: digits, hour_space: space,
    minute_zero: 1, minute_follow: 0, minute_startX: minuteX, minute_startY: y,
    minute_array: digits, minute_space: space, show_level: level,
  })
  ui.createWidget(ui.widget.IMG, { x: colonX, y, src: `${root}/time/colon.png`, show_level: level | edit })
  // IMG_TIME does not draw its digits in the editor. Show a static 10:08 on the same grid.
  for (const [start, pair] of [[hourX, [1, 0]], [minuteX, [0, 8]]] as const) {
    pair.forEach((digit, i) => ui.createWidget(ui.widget.IMG, {
      x: start + i * L.time.digitAdvance, y, src: digits[digit], show_level: edit,
    }))
  }
  return watchSteps(buildSlots(lang, root, level), root)
}
