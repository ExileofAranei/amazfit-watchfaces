import ui from '@zos/ui'
import { getLanguage } from '@zos/settings'
import { createBackground } from '@wf/core'
import { buildNormalScreen } from '../../segment/src/normal.ts'
import { buildNothing } from '../../nothing/src/screen.ts'

const RUSSIAN_LANGUAGE_CODE = 4

let releases: (() => void)[] = []

WatchFace({
  build() {
    createBackground()
    const lang = getLanguage() === RUSSIAN_LANGUAGE_CODE ? 'ru' : 'en'
    releases = [
      buildNormalScreen(lang),
      buildNothing({ lang, root: 'images/aod', level: ui.show_level.ONAL_AOD }),
    ]
  },
  onDestroy() { releases.forEach(release => release()) },
})
