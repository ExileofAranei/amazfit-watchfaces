import { defineFace } from '@wf/tooling'
import { layout } from './src/layout.ts'

const t = layout.time
const digitW = (h: number) => Math.round((186 * h) / 295)

/** Preview: "21:05" on black, 324×324 (Active Max watchface preview size per device list). */
const previewDigits = ['2', '1', 'colon', '0', '5']
const PH = 96
let px = 30
const previewItems = previewDigits.map((d) => {
  const item = { svg: `art/time/normal/${d}.svg`, x: px, y: (324 - PH) / 2, height: PH }
  px += (d === 'colon' ? Math.round((70 * PH) / 295) : digitW(PH)) + 6
  return item
})

export default defineFace({
  assetsDir: 'active-max',
  assets: [
    { from: 'art/time/normal', to: 'images/time/normal', height: t.normal.height },
    { from: 'art/time/normal', to: 'images/time/seconds', height: t.seconds.height },
    { from: 'art/time/aod', to: 'images/time/aod', height: t.aod.height },
  ],
  composites: [
    { to: 'images/preview.png', width: 324, height: 324, background: '#000000', items: previewItems },
  ],
  entries: {
    'app.js': 'src/app.ts',
    'watchface/index.js': 'src/watchface.ts',
  },
})
