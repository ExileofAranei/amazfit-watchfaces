import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DM_SAMPLE, LEVEL, record } from '../../packages/tooling/src/mock.ts'
import { PITCH } from './src/grid.ts'

/** Check the bundled widget positions against every rendered digit, including leading zeroes. */
export async function validateDotClock(face: string, assets: string, dir: string) {
  const widgets = await record(face, assets, DM_SAMPLE)
  const clock = widgets.find(w => w.type === 'IMG_TIME' && w.o.hour_array?.[0] === dir + '/0.png')?.o
  const colon = widgets.find(w => w.type === 'IMG' && w.o.src === dir + '/colon.png')?.o
  assert(clock && colon, 'Dot clock requires a separately positioned colon')
  assert.equal(clock.minute_follow, 0, 'Minute position must be independent of the hour suffix')
  assert.equal(clock.show_level & LEVEL.ONLY_EDIT, 0)
  assert.equal(colon.show_level, clock.show_level | LEVEL.ONLY_EDIT)
  assert.equal(colon.y, clock.hour_startY)
  assert.equal(colon.y, clock.minute_startY)
  const width = (path: string) => readFileSync(join(assets, path)).readUInt32BE(16)
  const editorDigits = widgets.filter(w => w.type === 'IMG' && w.o.show_level === LEVEL.ONLY_EDIT && w.o.src.startsWith(dir + '/'))
  const previewDigits = [1, 0, 0, 8]
  const positions = [
    clock.hour_startX, clock.hour_startX + width(clock.hour_array[1]) + clock.hour_space,
    clock.minute_startX, clock.minute_startX + width(clock.minute_array[0]) + clock.minute_space,
  ]
  assert.deepEqual(editorDigits.map(({ o }) => [o.src, o.x, o.y]),
    previewDigits.map((digit, i) => [dir + '/' + digit + '.png', positions[i], colon.y]),
    'Editor must render the four digits of 10:08 on the live clock grid')
  const digitWidths = clock.hour_array.map(width) as number[]
  for (const first of digitWidths) {
    for (const second of digitWidths) {
      const end = clock.hour_startX + first + clock.hour_space + second
      assert.equal(colon.x - end, PITCH, 'Expected one empty column before the colon')
    }
  }
  assert.equal(clock.minute_startX - colon.x - width(colon.src), PITCH, 'Expected one empty column after the colon')
}
