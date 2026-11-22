import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { textSvg } from './text.ts'
import type { AssetSet, Composite, TextSet } from './types.ts'

const viewBoxOf = (svg: string): [number, number] => {
  const m = svg.match(/viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/)
  if (!m) throw new Error('SVG without viewBox')
  return [Number(m[1]), Number(m[2])]
}

const write = (file: string, png: Buffer): void => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, png)
}

export function renderSet(faceDir: string, outRoot: string, set: AssetSet): number {
  const files: Record<string, string> = { ...set.files }
  if (set.from) {
    for (const f of readdirSync(join(faceDir, set.from)).filter((f) => f.endsWith('.svg')).sort()) {
      files[basename(f, '.svg')] = join(set.from, f)
    }
  }
  for (const [name, src] of Object.entries(files)) {
    let svg = readFileSync(join(faceDir, src), 'utf8')
    for (const [a, b] of Object.entries(set.recolor ?? {})) svg = svg.split(a).join(b)
    // fitTo 'height' ignores fractional values, so scale with an explicit zoom instead
    const [, vh] = viewBoxOf(svg)
    const png = new Resvg(svg, { fitTo: { mode: 'zoom', value: set.height / vh } }).render().asPng()
    write(join(outRoot, set.to, name + '.png'), png)
  }
  return Object.keys(files).length
}

export function renderTexts(faceDir: string, outRoot: string, set: TextSet): number {
  const style = { ...set.style, font: join(faceDir, set.style.font), extraGlyphs: set.style.extraGlyphs && join(faceDir, set.style.extraGlyphs) }
  const opts = { padTop: set.padTop, padBottom: set.padBottom }
  const first = Object.entries(set.items).map(([name, text]) => ({ name, text, ...textSvg(text, style, opts) }))
  const widest = Math.max(...first.map((r) => r.width))
  if (set.boxWidth && set.boxWidth < widest) throw new Error(`${set.to}: boxWidth ${set.boxWidth} < widest item ${widest}`)
  const boxWidth = set.uniformWidth ? (set.boxWidth ?? widest) : undefined
  for (const r of first) {
    const svg = boxWidth ? textSvg(r.text, style, { ...opts, boxWidth, align: set.uniformWidth }).svg : r.svg
    write(join(outRoot, set.to, r.name + '.png'), new Resvg(svg).render().asPng())
  }
  return first.length
}

/** Nests each source SVG as an <svg> element; resvg renders the result to PNG. */
export function renderComposite(faceDir: string, outRoot: string, c: Composite): void {
  const parts = c.items.map(({ svg, x, y, height }) => {
    const text = readFileSync(join(faceDir, svg), 'utf8')
    const vb = text.match(/viewBox="([^"]+)"/)![1]
    const [vw, vh] = viewBoxOf(text)
    const width = (vw * height) / vh
    const inner = text.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${vb}">${inner}</svg>`
  })
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}"><rect width="100%" height="100%" fill="${c.background}"/>${parts.join('')}</svg>`
  write(join(outRoot, c.to), new Resvg(doc).render().asPng())
}
