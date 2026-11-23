#!/usr/bin/env node
/**
 * wf <assets|bundle|build|preview|dev> [faceDir]
 *   assets  – render art/*.svg → assets/<target>/**.png
 *   bundle  – esbuild TS entries → app.js, watchface/index.js
 *   build   – assets + bundle + `zeus build` (→ dist/*.zab)
 *   preview / dev – assets + bundle + `zeus preview` / `zeus dev`
 *   mock    – assets + bundle + offline preview PNG (normal | AOD) → mock/preview.png
 */
import { build as esbuild } from 'esbuild'
import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderComposite, renderSet, renderTexts } from './assets.ts'
import { mock } from './mock.ts'
import type { FaceConfig } from './types.ts'

const [cmd = 'build', faceArg = '.'] = process.argv.slice(2)
const faceDir = resolve(faceArg)
const configPath = join(faceDir, 'face-config.ts')
const configUrl = pathToFileURL(existsSync(configPath) ? configPath : join(faceDir, 'face.config.ts'))
const config: FaceConfig = (await import(configUrl.href)).default

async function assets(): Promise<void> {
  const outRoot = join(faceDir, 'assets', config.assetsDir)
  rmSync(join(faceDir, 'assets'), { recursive: true, force: true })
  let n = 0
  for (const set of config.assets) n += renderSet(faceDir, outRoot, set)
  for (const set of config.texts ?? []) n += renderTexts(faceDir, outRoot, set)
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
if (cmd !== 'assets' || config.normalPreview) await bundle()
if (config.normalPreview) {
  const root = join(faceDir, 'assets', config.assetsDir)
  await mock(faceDir, root, join(root, config.normalPreview.to), undefined, false, config.normalPreview.size)
}
if (cmd === 'assets') process.exit(0)
if (cmd === 'bundle') process.exit(0)
if (cmd === 'mock') {
  await mock(faceDir, join(faceDir, 'assets', config.assetsDir), join(faceDir, 'mock', 'preview.png'), undefined, process.argv.includes('--taps'))
  console.log('[wf] mock → mock/preview.png')
  process.exit(0)
}
if (cmd === 'build' || cmd === 'preview' || cmd === 'dev') zeus(cmd)
