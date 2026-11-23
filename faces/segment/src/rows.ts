import ui, { getImageInfo, prop, deleteWidget } from '@zos/ui'

/** Position each image using its own advance, including the narrow Orbitron one. */
export function imageRow(cx: number, y: number, gap: number, level: number) {
  const widgets: ReturnType<typeof ui.createWidget>[] = []
  const widths = new Map<string, number>()
  return (paths: string[]) => {
    const advances = paths.map(path => {
      if (!widths.has(path)) widths.set(path, getImageInfo(path).width)
      return widths.get(path)!
    })
    const width = advances.reduce((sum, w) => sum + w, 0) + gap * (paths.length - 1)
    let x = Math.round(cx - width / 2)
    paths.forEach((src, i) => {
      if (widgets[i]) widgets[i].setProperty(prop.MORE, { x, y, src })
      else widgets.push(ui.createWidget(ui.widget.IMG, { x, y, src, show_level: level }))
      x += advances[i] + gap
    })
    while (widgets.length > paths.length) deleteWidget(widgets.pop()!)
  }
}
