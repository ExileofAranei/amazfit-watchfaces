import ui from '@zos/ui'
import { createBackground, createSegmentClock } from '@wf/core'
import { layout } from './layout.ts'

const { normal, seconds, aod } = layout.time

WatchFace({
  build() {
    createBackground()
    createSegmentClock([
      {
        digitsDir: 'images/time/normal',
        x: normal.x,
        y: normal.y,
        space: normal.space,
        showLevel: ui.show_level.ONLY_NORMAL,
        seconds: { digitsDir: 'images/time/seconds', x: seconds.x, y: seconds.y, space: seconds.space },
      },
      {
        digitsDir: 'images/time/aod',
        x: aod.x,
        y: aod.y,
        space: aod.space,
        showLevel: ui.show_level.ONAL_AOD,
      },
    ])
  },
})
