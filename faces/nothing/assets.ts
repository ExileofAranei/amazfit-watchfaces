import type { AssetSet, Composite, TextSet, TextStyle } from '@wf/tooling'
import { layout } from './src/layout.ts'

/**
 * NOTHING's asset sets, reusable by another face.
 * `base`: path from the consuming face dir to faces/nothing ('' for NOTHING itself).
 * `root`: output folder under assets/<target>/, matching `root` in buildNothing.
 */
export interface Assets { assets: AssetSet[]; texts: TextSet[]; composites: Composite[] }

// Relative to the face dir; every face sits at faces/<name>, so the font resolves from any of them.
const ORBITRON = '../../fonts/orbitron/orbitron-vf.ttf'
const metric: TextStyle = { font: ORBITRON, wght: 450, cap: layout.slots.cap, color: layout.color, tracking: 0, scaleX: 0.958 }
const digits = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i), String(i)]))

export function nothingAssets(base = '', root = 'images'): Assets {
  const icon = (name: string): string => `${base}art/icons/${name}.svg`
  return {
    assets: [
      { from: `${base}art/time`, to: `${root}/time`, height: layout.time.height },
      { from: `${base}art/edit`, to: `${root}/edit`, height: 48 },
    ],
    texts: [
      { to: `${root}/font/metric`, style: metric, items: digits, uniformWidth: 'center' },
      { to: `${root}/font/metric`, style: metric, items: { percent: '%', minus: '-' } },
      { to: `${root}/font/steps`, style: metric, items: digits },
    ],
    composites: ['steps', 'heart', 'battery'].map(name => ({
      to: `${root}/edit/${name}.png`, width: 160, height: 48, background: '#000000',
      items: [{ svg: icon(name === 'battery' ? 'bolt' : name), x: 66, y: 10, height: 28 }],
    })),
  }
}
