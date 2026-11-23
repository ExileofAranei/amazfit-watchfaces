import { validateDotClock } from './validate-clock.ts'
import { defineFace } from '@wf/tooling'
import { nothingAssets } from './assets.ts'

const { assets, texts, composites } = nothingAssets()

export default defineFace({
  assetsDir: 'active-max',
  assets,
  texts,
  composites,
  validate: (face, assets) => validateDotClock(face, assets, 'images/time'),
  normalPreview: { to: 'images/preview.png', size: 324 },
  entries: {
    'app.js': 'src/app.ts',
    'watchface/index.js': 'src/watchface.ts',
  },
})
