import { defineFace } from '@wf/tooling'
import { aodAssets, normalAssets } from './assets.ts'

const normal = normalAssets()
const aod = aodAssets()

export default defineFace({
  assetsDir: 'active-max',
  assets: [...normal.assets, ...aod.assets],
  texts: [...normal.texts, ...aod.texts],
  normalPreview: { to: 'images/preview.png', size: 324 },
  entries: {
    'app.js': 'src/app.ts',
    'watchface/index.js': 'src/watchface.ts',
  },
})
