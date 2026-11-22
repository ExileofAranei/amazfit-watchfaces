/** A set of SVG files rendered to PNG at a fixed pixel height (width keeps the SVG aspect ratio). */
export interface AssetSet {
  /** Source folder with *.svg, relative to the face dir */
  from: string
  /** Output folder relative to assets/<target>/ — this is the path used in widget code */
  to: string
  height: number
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
  composites?: Composite[]
  /** output js (relative to face dir) → TS entry */
  entries: Record<string, string>
}

export const defineFace = (c: FaceConfig): FaceConfig => c
