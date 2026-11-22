#!/usr/bin/env node
/**
 * wf <assets|bundle|build|preview|dev> [faceDir]
 *   assets  – render art/*.svg → assets/<target>/**.png
 *   bundle  – esbuild TS entries → app.js, watchface/index.js
 *   build   – assets + bundle + `zeus build` (→ dist/*.zab)
 *   preview / dev – assets + bundle + `zeus preview` / `zeus dev`
 */
import { build as esbuild } from 'esbuild'
import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderComposite, renderSet } from './assets.ts'
import type { FaceConfig } from './types.ts'

const [cmd = 'build', faceArg = '.'] = process.argv.slice(2)
const faceDir = resolve(faceArg)
const config: FaceConfig = (await import(pathToFileURL(join(faceDir, 'face.config.ts')).href)).default

async function assets(): Promise<void> {
  const outRoot = join(faceDir, 'assets', config.assetsDir)
  rmSync(join(faceDir, 'assets'), { recursive: true, force: true })
  let n = 0
  for (const set of config.assets) n += renderSet(faceDir, outRoot, set).length
  for (const c of config.composites ?? []) (renderComposite(faceDir, outRoot, c), n++)
  console.log(`[wf] assets: ${n} png → assets/${config.assetsDir}`)
}

async function bundle(): Promise<void> {
  for (const [out, entry] of Object.entries(config.entries)) {
    await esbuild({
      entryPoints: [join(faceDir, entry)],
      outfile: join(faceDir, out),
      bundle: true,
      format: 'esm',
      target: 'es2020',
      external: ['@zos/*'],
      logLevel: 'warning',
    })
  }
  console.log(`[wf] bundle: ${Object.keys(config.entries).join(', ')}`)
}

function zeus(sub: string): void {
  const r = spawnSync('npx', ['--no-install', 'zeus', sub], { cwd: faceDir, stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

await assets()
if (cmd === 'assets') process.exit(0)
await bundle()
if (cmd === 'bundle') process.exit(0)
if (cmd === 'build' || cmd === 'preview' || cmd === 'dev') zeus(cmd)
