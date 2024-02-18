/* eslint-disable no-console */
import { dirname, isAbsolute, join, parse } from 'node:path'
import fs from 'node:fs'
import process from 'node:process'
import { resolveConfig, build as viteBuild } from 'vite'
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router-dom/server'
import React from 'react'
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'

export type SSRManifest = Record<string, string[]>
export interface ManifestItem {
  css?: string[]
  file: string
  dynamicImports?: string[]
  src: string
  assets?: string[]
}

export type Manifest = Record<string, ManifestItem>

function createRequest(path: string) {
  const url = new URL(path, 'http://pkm.com')
  url.search = ''
  url.hash = ''
  url.pathname = path

  return new Request(url.href)
}

function renderHTML(rootContainerId: string, indexHTML: string, appHTML: string) {
  const container = `<div id="${rootContainerId}"></div>`
  if (!indexHTML.includes(container))
    console.error(`${rootContainerId} not found`)

  return indexHTML
    .replace(
      container,
      `<div id="${rootContainerId}" data-server-rendered="true">${appHTML}</div>`,
    )
}

async function build() {
  const config = await resolveConfig({}, 'build', 'production')
  const root = config.root || process.cwd()
  const ssgOut = join(root, '.vite-pkm-temp', Math.random().toString(36).substring(2, 12))
  const outDir = config.build.outDir || 'dist'
  const out = isAbsolute(outDir) ? outDir : join(root, outDir)

  if (fs.existsSync(ssgOut))
    fs.rm(ssgOut, { recursive: true }, () => { })

  // client
  console.log('Build for client...')
  await viteBuild({
    build: {
      manifest: true,
      ssrManifest: true,
      rollupOptions: {
        input: {
          app: join(root, './index.html'),
        },
      },
    },
    mode: config.mode,
  })

  console.log('Build for server...')
  process.env.VITE_SSG = 'true'
  const resolver = config.createResolver()
  let entry = await resolver('src/main.tsx', config.root)
  entry = entry || join(config.root, 'src/main.tsx')
  await viteBuild({
    build: {
      ssr: entry,
      outDir: ssgOut,
      minify: false,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: '[name].mjs',
          format: 'esm',
        },
      },
    },
    mode: config.mode,
    base: config.base,
  })

  const serverEntry = join(ssgOut, `${parse(entry).name}.mjs`)
  const { createApp } = await import(serverEntry)
  const { routes } = await createApp(true)

  // const ssrManifest: SSRManifest = JSON.parse(fs.readFileSync(join(config.build.outDir, 'ssr-manifest.json'), 'utf-8'))
  // const manifest: Manifest = JSON.parse(fs.readFileSync(join(config.build.outDir, 'manifest.json'), 'utf-8'))
  const indexHTML = fs.readFileSync(join(config.build.outDir, 'index.html'), 'utf-8')

  for (const route of routes[0].children) {
    const request = createRequest(route.path)
    const { dataRoutes, query } = createStaticHandler(routes)
    const context = await query(request)
    if (context instanceof Response)
      throw context

    const router = createStaticRouter(dataRoutes, context)
    const app = React.createElement(StaticRouterProvider, { context, router })
    const appHTML = renderToString(app)
    const renderedHTML = renderHTML('root', indexHTML, appHTML)
    const jsdom = new JSDOM(renderedHTML)
    const html = jsdom.serialize()

    const path = route.path
    const filename = `${(path.endsWith('/')
      ? `${path}index`
      : path).replace(/^\//g, '')}.html`

    if (!fs.existsSync(join(out, filename)))
      fs.mkdirSync(join(out, dirname(filename)), { recursive: true })

    fs.writeFileSync(join(out, filename), html, 'utf-8')
  }

  fs.rm(ssgOut, { recursive: true }, () => { })
}

build()
