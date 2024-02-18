import { extname, join, relative, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import fg from 'fast-glob'
import type { Plugin } from 'vite'
import matter from 'gray-matter'
import type { Backlink } from 'virtual:pkm'

// This regex finds all wikilinks in a string
const wikilinkRegExp = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g

class Context {
  private pages = []
  private backlinks = new Map<string, string[]>()

  async setup() {
    await this.walkDir()
  }

  private async walkDir() {
    const dir = resolve('articles')
    const srcDir = resolve('src')
    const files = fg.sync('**/*.md', {
      onlyFiles: true,
      cwd: dir,
    }).map(p => join(dir, p).replace(/\\/g, '/'))

    files.forEach((file) => {
      const article = readFileSync(file, { encoding: 'utf-8' })

      // NOTE: This is a hack to get the relative path from the src directory
      const relpath = relative(dir, file)

      const path = `/${relpath.replace(extname(relpath), '').replace('index', '')}`
      const { data, content } = matter(article)
      this.parseBacklinks(content, path)
      this.pages.push({
        file: relative(srcDir, file),
        path,
        meta: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      })
    })
  }

  private parseBacklinks(content: string, path: string) {
    const matches = (content.match(wikilinkRegExp) || []) as string[]
    const links = matches
      .map(link => (
        link.slice(2, -2).split('|')[0].trim()
      ))
      .filter(link => link !== path)

    links.forEach((link) => {
      const backlinks = this.backlinks.get(link)
      if (backlinks && !backlinks.includes(path))
        backlinks.push(path)
      else
        this.backlinks.set(link, [path])
    })
  }

  get pageRoutes() {
    const matters = []
    this.pages.forEach((page) => {
      const pagelinks = this.backlinks.get(page.path)
      if (pagelinks) {
        const links = []
        pagelinks.forEach((link) => {
          const page = this.pages.find(p => p.path === link)
          if (!page)
            return
          links.push({
            title: page.meta.title,
            link,
          })
        })
        matters.push({
          ...page,
          backlinks: links,
        })
      }
      else {
        matters.push({
          ...page,
          backlinks: [],
        })
      }
    })
    return matters
  }
}

export default function pageMatter(): Plugin {
  const virtualModuleId = 'virtual:pkm'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  let ctx: Context

  return {
    name: 'pkm-plugin-matter',
    enforce: 'pre',
    async configResolved() {
      ctx = new Context()
      await ctx.setup()
    },
    resolveId(id) {
      if (id === virtualModuleId)
        return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const pages = ctx.pageRoutes
        return `export default ${JSON.stringify(pages)}`
      }
    },
  }
}
