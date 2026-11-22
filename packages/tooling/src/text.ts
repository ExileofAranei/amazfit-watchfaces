import * as fontkit from 'fontkit'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Text → SVG outlines. Latin/digits come from a variable font instance (fontkit), extra glyphs
 * (e.g. our Cyrillic) from per-glyph SVGs whose `d` is in font units, y-up, baseline 0.
 */
export interface TextStyle {
  /** Path to the variable TTF (relative to repo root resolved by caller) */
  font: string
  wght: number
  /** Cap height in px — the font size is derived from it */
  cap: number
  color: string
  /** Extra space between glyphs, font units */
  tracking?: number
  /** Horizontal glyph scale (1 = font as designed); used to match a narrower reference rendering */
  scaleX?: number
  /** Folder with <char>.svg + metrics.json (latinAliases) for glyphs missing in the font */
  extraGlyphs?: string
}

interface Glyph {
  d: string
  advance: number
}

const fontCache = new Map<string, fontkit.Font>()
function instance(path: string, wght: number): fontkit.Font {
  const key = `${path}@${wght}`
  let f = fontCache.get(key)
  if (!f) {
    const base = fontkit.openSync(path) as fontkit.Font
    f = base.getVariation({ wght }) as fontkit.Font
    fontCache.set(key, f)
  }
  return f
}

const extraCache = new Map<string, { glyphs: Map<string, Glyph>; aliases: Record<string, string> }>()
function extras(dir: string) {
  let e = extraCache.get(dir)
  if (!e) {
    const metrics = JSON.parse(readFileSync(join(dir, 'metrics.json'), 'utf8'))
    const glyphs = new Map<string, Glyph>()
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.svg'))) {
      const ch = file.replace('.svg', '')
      const d = readFileSync(join(dir, file), 'utf8').match(/\sd="([^"]+)"/)?.[1]
      const m = metrics.glyphs?.[ch]
      if (d && m) glyphs.set(ch, { d, advance: m.advanceWidth })
    }
    e = { glyphs, aliases: metrics.latinAliases ?? {} }
    extraCache.set(dir, e)
  }
  return e
}

export interface ShapedText {
  /** SVG paths positioned in px, baseline at y = 0 */
  paths: string
  /** Advance width of the whole string incl. side bearings, px */
  width: number
  /** Ink bounds, px (x relative to origin, y relative to baseline, y-down) */
  inkTop: number
  inkBottom: number
}

export function shape(text: string, style: TextStyle): ShapedText {
  const font = instance(style.font, style.wght)
  const capUnits = font.capHeight || 720
  const scale = style.cap / capUnits
  const sx = scale * (style.scaleX ?? 1)
  const ex = style.extraGlyphs ? extras(style.extraGlyphs) : undefined
  let x = 0
  let paths = ''
  let top = 0
  let bottom = 0
  const chars = [...text]
  chars.forEach((raw, i) => {
    let d: string
    let advance: number
    const extra = ex?.glyphs.get(raw)
    if (extra) {
      d = extra.d
      advance = extra.advance
    } else {
      const ch = ex?.aliases[raw] ?? raw
      const g = font.glyphForCodePoint(ch.codePointAt(0)!)
      d = g.path.toSVG()
      advance = g.advanceWidth
      const bb = g.bbox
      top = Math.min(top, -bb.maxY * scale)
      bottom = Math.max(bottom, -bb.minY * scale)
    }
    paths += `<path transform="translate(${(x * sx).toFixed(3)},0) scale(${sx},${-scale})" d="${d}" fill="${style.color}"/>`
    x += advance + (i < chars.length - 1 ? (style.tracking ?? 0) : 0)
  })
  if (ex) top = Math.min(top, -capUnits * scale)
  return { paths, width: x * sx, inkTop: top, inkBottom: bottom }
}

/**
 * Renders a string into an SVG document of fixed height: `cap` px of caps plus `padTop`/`padBottom`.
 * Width is the advance width, or `boxWidth` with the text aligned inside it.
 */
export function textSvg(
  text: string,
  style: TextStyle,
  opts: { padTop?: number; padBottom?: number; boxWidth?: number; align?: 'left' | 'center' | 'right' } = {},
): { svg: string; width: number; height: number } {
  const s = shape(text, style)
  const padTop = opts.padTop ?? 1
  const padBottom = opts.padBottom ?? 1
  const width = Math.ceil(opts.boxWidth ?? s.width)
  const height = Math.ceil(style.cap + padTop + padBottom)
  const dx = opts.align === 'center' ? (width - s.width) / 2 : opts.align === 'right' ? width - s.width : 0
  const baseline = padTop + style.cap
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="translate(${dx.toFixed(3)},${baseline})">${s.paths}</g></svg>`
  return { svg, width, height }
}

export const measure = (text: string, style: TextStyle): number => shape(text, style).width
