import ui from '@zos/ui'
import { getLanguage } from '@zos/settings'
import { createBackground } from '@wf/core'
import { buildNothing } from './screen.ts'

const RUSSIAN_LANGUAGE_CODE = 4

let release: (() => void) | undefined

WatchFace({
  build() {
    createBackground()
    release = buildNothing({
      lang: getLanguage() === RUSSIAN_LANGUAGE_CODE ? 'ru' : 'en',
      root: 'images',
      // The face looks the same on the normal screen and in AOD.
      level: ui.show_level.ONLY_NORMAL | ui.show_level.ONAL_AOD,
    })
  },
  onDestroy() { release?.() },
})
