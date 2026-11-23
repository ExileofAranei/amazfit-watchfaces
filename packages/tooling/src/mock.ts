/**
 * Offline preview: runs the bundled watchface with stubbed @zos/* modules, records createWidget calls
 * and draws them with sample data. An approximation of the device renderer — good for layout checks,
 * not a substitute for the simulator or the watch.
 */
import { Resvg } from '@resvg/resvg-js'
import { build as esbuild } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface Sample {
  /** System language code returned by @zos/settings (4 = ru-RU). */
  languageCode?: number
  editTypes?: Record<number, number>
  time: [number, number, number]
  day: number
  month: number
  /** 1 = Monday … 7 = Sunday */
  weekday: number
  values: Record<string, string>
  weather: number
  alarm: boolean
}

export const DM_SAMPLE: Sample = {
  time: [21, 5, 46],
  day: 23,
  month: 9,
  weekday: 1,
  values: { BATTERY: '76', STEP: '8000', CAL: '228', HEART: '64', DISTANCE: '5.62', WEATHER_CURRENT: '-5' },
  weather: 0,
  alarm: true,
}

type Opts = Record<string, any>
interface Recorded { type: string; o: Opts }

export const LEVEL = { ONLY_NORMAL: 1, ONAL_AOD: 2, ONLY_EDIT: 4 }
const named = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, k]))

export async function record(faceDir: string, assetsRoot: string, sample: Sample): Promise<Recorded[]> {
  const out = await esbuild({
    entryPoints: [join(faceDir, 'watchface/index.js')],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'neutral',
    plugins: [{
      name: 'zos-stub',
      setup(b) {
        b.onResolve({ filter: /^@zos\// }, (a) => ({ path: a.path, namespace: 'zos' }))
        b.onLoad({ filter: /.*/, namespace: 'zos' }, (a) => ({
          contents: a.path === '@zos/ui'
            ? 'const u = globalThis.__zosUi; export default u; export const createWidget = u.createWidget, widget = u.widget, show_level = u.show_level, align = u.align, data_type = u.data_type, system_status = u.system_status, prop = u.prop, getImageInfo = u.getImageInfo, deleteWidget = u.deleteWidget;'
            : a.path === '@zos/sensor'
              ? 'const s = globalThis.__zosSample; export class Step { getCurrent() { return Number(s.values.STEP) } onChange() {} offChange() {} } export class Time { getHours() { return s.time[0] } getMinutes() { return s.time[1] } getDate() { return s.day } getMonth() { return s.month } onPerDay() {} onPerMinute() {} }'
            : a.path === '@zos/utils'
              ? 'export const px = (v) => v; export const log = { getLogger: () => ({ log() {}, error() {} }) };'
              : 'export const getScene = () => 0, SCENE_AOD = 1, SCENE_WATCHFACE = 0; export const getLanguage = () => globalThis.__zosSample.languageCode ?? 4;',
          loader: 'js',
        }))
      },
    }],
  })
  const calls: Recorded[] = []
  const g = globalThis as any
  g.__zosSample = sample
  g.__zosUi = {
    prop: { MORE: 'MORE', CURRENT_TYPE: 'CURRENT_TYPE' },
    getImageInfo: (path: string) => {
      const b = readFileSync(join(assetsRoot, path))
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
    },
    createWidget: (type: string, o: Opts) => {
      calls.push({ type, o })
      return {
        setProperty() {},
        getProperty: (key: string) => key === 'CURRENT_TYPE' ? sample.editTypes?.[o.edit_id] ?? o.default_type : undefined,
      }
    },
    widget: named(['WATCHFACE_EDIT_GROUP', 'IMG', 'FILL_RECT', 'TEXT', 'IMG_TIME', 'TEXT_IMG', 'IMG_DATE', 'IMG_WEEK', 'IMG_LEVEL', 'IMG_STATUS', 'IMG_CLICK']),
    show_level: LEVEL,
    align: { LEFT: 'L', RIGHT: 'R', CENTER_H: 'C', CENTER_V: 'V', TOP: 'T', BOTTOM: 'B' },
    data_type: named(['BATTERY', 'STEP', 'CAL', 'HEART', 'DISTANCE', 'WEATHER', 'WEATHER_CURRENT', 'ALARM_CLOCK']),
    system_status: named(['CLOCK', 'DISCONNECT', 'DISTURB', 'LOCK']),
  }
  let face: any
  g.WatchFace = (f: any) => (face = f)
  new Function(out.outputFiles[0].text)()
  face?.onInit?.()
  face?.build?.()
  return calls
}

export async function mock(faceDir: string, assetsRoot: string, outFile: string, sample = DM_SAMPLE, debugTaps = false, normalPreviewSize?: number): Promise<void> {
  const calls = await record(faceDir, assetsRoot, sample)
  const size = (p: string): [number, number] => {
    const b = readFileSync(join(assetsRoot, p))
    return [b.readUInt32BE(16), b.readUInt32BE(20)]
  }
  const img = (p: string, x: number, y: number): string => {
    const [w, h] = size(p)
    return `<image href="data:image/png;base64,${readFileSync(join(assetsRoot, p)).toString('base64')}" x="${x}" y="${y}" width="${w}" height="${h}"/>`
  }
  /** Lays out a row of images; returns svg and total width */
  const row = (paths: string[], space: number) => {
    const widths = paths.map((p) => size(p)[0])
    return { paths, widths, width: widths.reduce((a, b) => a + b, 0) + space * Math.max(0, paths.length - 1) }
  }
  const drawRow = (r: ReturnType<typeof row>, x: number, y: number, space: number) => {
    let s = ''
    r.paths.forEach((p, i) => { s += img(p, x, y); x += r.widths[i] + space })
    return s
  }
  const pad2 = (n: number) => String(n).padStart(2, '0')

  const scene = (level: number): string => {
    let s = ''
    for (const { type, o } of calls) {
      if (o.show_level !== undefined && !(o.show_level & level)) continue
      if (type === 'IMG_CLICK' && !(debugTaps && level === LEVEL.ONLY_NORMAL)) continue
      switch (type) {
        case 'FILL_RECT':
          s += `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="#${o.color.toString(16).padStart(6, '0')}"/>`
          break
        case 'IMG':
          s += img(o.src, o.x, o.y)
          break
        case 'IMG_STATUS':
          if (o.type === 'CLOCK' && sample.alarm) s += img(o.src, o.x, o.y)
          break
        case 'IMG_LEVEL':
          s += img(o.image_array[o.type === 'WEATHER' ? sample.weather : (o.level ?? 0)], o.x, o.y)
          break
        case 'IMG_WEEK':
          s += img(o.week_en[sample.weekday - 1], o.x, o.y)
          break
        case 'IMG_DATE':
          if (o.month_en_array) s += o.month_is_character
            ? img(o.month_en_array[sample.month - 1], o.month_startX, o.month_startY)
            : drawRow(row([...pad2(sample.month)].map((c) => o.month_en_array[+c]), o.month_space ?? 0), o.month_startX, o.month_startY, o.month_space ?? 0)
          if (o.day_en_array) {
            const digits = o.day_zero ? pad2(sample.day) : String(sample.day)
            s += drawRow(row([...digits].map((c) => o.day_en_array[+c]), o.day_space ?? 0), o.day_startX, o.day_startY, o.day_space ?? 0)
          }
          break
        case 'IMG_TIME': {
          const [hh, mm, ss] = sample.time
          const hs = o.hour_space ?? 0
          const hours = [...pad2(hh)].map(c => o.hour_array[+c])
          if (o.hour_unit_en) hours.push(o.hour_unit_en)
          const hRow = row(hours, hs)
          s += drawRow(hRow, o.hour_startX, o.hour_startY, hs)
          const ms = o.minute_space ?? 0
          const minutes = row([...pad2(mm)].map(c => o.minute_array[+c]), ms)
          const mx = o.minute_follow ? o.hour_startX + hRow.width + hs : o.minute_startX
          s += drawRow(minutes, mx, o.minute_follow ? o.hour_startY : o.minute_startY, ms)
          if (o.second_array) s += drawRow(row([...pad2(ss)].map((c) => o.second_array[+c]), o.second_space ?? 0), o.second_startX, o.second_startY, o.second_space ?? 0)
          break
        }
        case 'TEXT_IMG': {
          const v = o.text ?? sample.values[o.type] ?? '0'
          const paths: string[] = []
          for (const c of v) paths.push(c === '-' ? o.negative_image : c === '.' ? o.dot_image : o.font_array[+c])
          if (o.unit_en) paths.push(o.unit_en)
          const r = row(paths, o.h_space ?? 0)
          const x = o.align_h === 'C' ? o.x + (o.w - r.width) / 2 : o.align_h === 'R' ? o.x + o.w - r.width : o.x
          s += drawRow(r, x, o.y, o.h_space ?? 0)
          break
        }
        case 'IMG_CLICK':
          s += `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="none" stroke="#3af" stroke-dasharray="4 3"/>`
          break
      }
    }
    return s
  }
  const face = (body: string, ox: number) =>
    `<g transform="translate(${ox},0)"><circle cx="240" cy="240" r="240" fill="#000"/><g clip-path="url(#c)">${body}</g></g>`
  const svg = normalPreviewSize
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${normalPreviewSize}" height="${normalPreviewSize}" viewBox="0 0 480 480"><rect width="480" height="480" fill="#000"/>${scene(LEVEL.ONLY_NORMAL)}</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="480"><defs><clipPath id="c"><circle cx="240" cy="240" r="240"/></clipPath></defs><rect width="1000" height="480" fill="#1c1c22"/>${face(scene(LEVEL.ONLY_NORMAL), 0)}${face(scene(LEVEL.ONAL_AOD), 520)}</svg>`
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, new Resvg(svg).render().asPng())
}
