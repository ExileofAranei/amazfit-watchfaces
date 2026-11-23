/**
 * Dot-matrix glyphs for the time: 8×12 frame, 2-dot strokes. Single source for art/time.
 * Run `npm run glyphs -w faces/nothing` after editing to regenerate art/time/*.svg.
 *   █ lit dot   · empty
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { COLS, PITCH, RADIUS, ROWS } from '../src/grid.ts'

const g = (s: string): string[] => s.trim().split('\n').map((r) => r.trim())

export const digits: string[][] = [
  g(`
    ·██████·
    ████████
    ██····██
    ██····██
    ██····██
    ██····██
    ██····██
    ██····██
    ██····██
    ██····██
    ████████
    ·██████·`),
  g(`
    ···██···
    ··███···
    ·████···
    ···██···
    ···██···
    ···██···
    ···██···
    ···██···
    ···██···
    ···██···
    ·██████·
    ·██████·`),
  g(`
    ███████·
    ████████
    ······██
    ······██
    ······██
    ·███████
    ███████·
    ██······
    ██······
    ██······
    ████████
    ·███████`),
  g(`
    ███████·
    ████████
    ······██
    ······██
    ······██
    ████████
    ████████
    ······██
    ······██
    ······██
    ████████
    ███████·`),
  g(`
    ██····██
    ██····██
    ██····██
    ██····██
    ██····██
    ████████
    ·███████
    ······██
    ······██
    ······██
    ······██
    ······██`),
  g(`
    ·███████
    ████████
    ██······
    ██······
    ██······
    ███████·
    ·███████
    ······██
    ······██
    ······██
    ████████
    ███████·`),
  g(`
    ·██████·
    ███████·
    ██······
    ██······
    ██······
    ███████·
    ████████
    ██····██
    ██····██
    ██····██
    ████████
    ·██████·`),
  g(`
    ███████·
    ████████
    ······██
    ·····██·
    ····██··
    ···██···
    ···██···
    ···██···
    ···██···
    ···██···
    ···██···
    ···██···`),
  g(`
    ·██████·
    ████████
    ██····██
    ██····██
    ██····██
    ████████
    ████████
    ██····██
    ██····██
    ██····██
    ████████
    ·██████·`),
  g(`
    ·██████·
    ████████
    ██····██
    ██····██
    ██····██
    ████████
    ·███████
    ······██
    ······██
    ······██
    ·███████
    ·██████·`),
]

/** 2 columns wide, squares symmetric about the frame's middle (3 rows above, 3 below). */
export const colon = g(`
  ··
  ··
  ··
  ██
  ██
  ··
  ··
  ██
  ██
  ··
  ··
  ··`)

/** One colour, the same on the normal screen and in AOD. Unlit dots are not drawn. */
export const COLOR = '#F2F2F2'

function svg(rows: string[]): string {
  const w = rows[0].length * PITCH
  const h = rows.length * PITCH
  const dots: string[] = []
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '█') dots.push(`  <circle cx="${x * PITCH + PITCH / 2}" cy="${y * PITCH + PITCH / 2}" r="${RADIUS}" fill="${COLOR}" />`)
  }))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${dots.join('\n')}\n</svg>\n`
}

function check(name: string, rows: string[], cols: number): void {
  if (rows.length !== ROWS || rows.some((r) => [...r].length !== cols || /[^█·]/.test(r))) {
    throw new Error(`glyph ${name}: expected ${cols}×${ROWS} of █/·`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'time')
  mkdirSync(dir, { recursive: true })
  digits.forEach((rows, d) => {
    check(String(d), rows, COLS)
    writeFileSync(join(dir, `${d}.svg`), svg(rows))
  })
  check('colon', colon, 2)
  writeFileSync(join(dir, 'colon.svg'), svg(colon))
  console.log('glyphs → art/time')
}
