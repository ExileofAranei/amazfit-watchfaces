import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import type { AssetSet, Composite } from './types.ts'

const viewBoxOf = (svg: string): [number, number] => {
  const m = svg.match(/viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/)
  if (!m) throw new Error('SVG without viewBox')
  return [Number(m[1]), Number(m[2])]
}

export function renderSet(faceDir: string, outRoot: string, set: AssetSet): string[] {
  const src = join(faceDir, set.from)
  const out = join(outRoot, set.to)
  mkdirSync(out, { recursive: true })
  const written: string[] = []
  for (const file of readdirSync(src).filter((f) => f.endsWith('.svg')).sort()) {
    const svg = readFileSync(join(src, file), 'utf8')
    const png = new Resvg(svg, { fitTo: { mode: 'height', value: set.height } }).render().asPng()
    const target = join(out, basename(file, '.svg') + '.png')
    writeFileSync(target, png)
    written.push(target)
  }
  return written
}

/** Nests each source SVG as an <svg> element; resvg renders the result to PNG. */
export function renderComposite(faceDir: string, outRoot: string, c: Composite): string {
  const parts = c.items.map(({ svg, x, y, height }) => {
    const text = readFileSync(join(faceDir, svg), 'utf8')
    const [vw, vh] = viewBoxOf(text)
    const width = (vw * height) / vh
    const inner = text.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${vw} ${vh}">${inner}</svg>`
  })
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}"><rect width="100%" height="100%" fill="${c.background}"/>${parts.join('')}</svg>`
  const target = join(outRoot, c.to)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, new Resvg(doc).render().asPng())
  return target
}
