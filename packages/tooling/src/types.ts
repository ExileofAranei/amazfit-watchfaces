import type { TextStyle } from './text.ts'

/** SVG files rendered to PNG at a fixed pixel height (width keeps the SVG aspect ratio). */
export interface AssetSet {
  /** Source folder with *.svg, relative to the face dir (all files are rendered) */
  from?: string
  /** Or an explicit map: output name (no extension) → source svg relative to the face dir */
  files?: Record<string, string>
  /** Output folder relative to assets/<target>/ — the path used in widget code */
  to: string
  height: number
  /** Literal colour replacements applied to the SVG source, e.g. { '#F6F5FC': '#B9B9BE' } */
  recolor?: Record<string, string>
}

/** Strings rendered with a font into one PNG each. */
export interface TextSet {
  to: string
  style: TextStyle
  /** output name (no extension) → text */
  items: Record<string, string>
  padTop?: number
  padBottom?: number
  /** Pad every image to the widest one, text aligned inside (lets fixed-position widgets centre text) */
  uniformWidth?: 'center' | 'left' | 'right'
  /** Fixed width for uniformWidth (defaults to the widest item); must be ≥ the widest item */
  boxWidth?: number
}

/** A PNG composed of several SVGs on a canvas (used for the store/preview icon). */
export interface Composite {
  to: string
  width: number
  height: number
  background: string
  items: { svg: string; x: number; y: number; height: number }[]
}

export interface FaceConfig {
  /** Key of `targets` in app.json; assets go to assets/<assetsDir>/ */
  assetsDir: string
  assets: AssetSet[]
  texts?: TextSet[]
  composites?: Composite[]
  /** Picker image rendered from the normal scene at build time. */
  normalPreview?: { to: string; size: number }
  /** output js (relative to face dir) → TS entry */
  entries: Record<string, string>
}

export const defineFace = (c: FaceConfig): FaceConfig => c
