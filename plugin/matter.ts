import path, { extname, join, relative, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import fg from 'fast-glob'
import type { Plugin } from 'vite'
import matter from 'gray-matter'
import type { PageMatter } from 'virtual:pkm'

// This regex finds all wikilinks in a string
const wikilinkRegExp = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g

class Context {
  private pages = []
  private wikilinks: { [key: string]: string[] } = {}

  async setup() {
    await this.walkDir()
  }

  private formatDate(date?: Date) {
    if (!date)
      return null
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
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
          date: data.date ? new Date(data.date) : null,
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

    this.wikilinks[path] = links
  }

  get pageRoutes() {
    const matters: PageMatter[] = this.pages.sort((a, b) => {
      if (a.meta.date && b.meta.date)
        return b.meta.date.getTime() - a.meta.date.getTime()

      return 0
    }).map(page => ({
      ...page,
      meta: {
        ...page.meta,
        date: this.formatDate(page.meta.date),
      },
      backlinks: [],
    }))

    for (const wikilink in this.wikilinks) {
      const wikiPage = matters.find(p => p.path === wikilink)
      const links = this.wikilinks[wikilink]
      links.forEach((link) => {
        const page = matters.find(p => p.path.endsWith(link))
        if (page && !page.backlinks.some(b => b.link === wikilink)) {
          page.backlinks.push({
            title: wikiPage.meta.title,
            link: wikilink,
          })
        }
      })
    }

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
