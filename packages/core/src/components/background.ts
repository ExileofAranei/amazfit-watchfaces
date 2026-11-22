import ui from '@zos/ui'
import { px } from '@zos/utils'

/** Solid background for both normal and AOD scenes (AOD requires black). */
export function createBackground(color = 0x000000, size = 480): void {
  ui.createWidget(ui.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: px(size),
    h: px(size),
    color,
    show_level: ui.show_level.ONLY_NORMAL | ui.show_level.ONAL_AOD,
  })
}
