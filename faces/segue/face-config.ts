import { validateDotClock } from '../nothing/validate-clock.ts'
import { defineFace } from '@wf/tooling'
import { normalAssets } from '../segment/assets.ts'
import { nothingAssets } from '../nothing/assets.ts'

/** No art of its own: the normal screen comes from SEGMENT, AOD from NOTHING (under images/aod). */
const normal = normalAssets('../segment/')
const aod = nothingAssets('../nothing/', 'images/aod')

export default defineFace({
  assetsDir: 'active-max',
  assets: [...normal.assets, ...aod.assets],
  texts: [...normal.texts, ...aod.texts],
  composites: aod.composites,
  validate: (face, assets) => validateDotClock(face, assets, 'images/aod/time'),
  normalPreview: { to: 'images/preview.png', size: 324 },
  entries: {
    'app.js': 'src/app.ts',
    'watchface/index.js': 'src/watchface.ts',
  },
})
