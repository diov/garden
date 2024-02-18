import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Plugin } from 'vite'
import Shiki from '@shikijs/markdown-it'
import type { ShikiTransformer } from 'shiki'
import { wikilink } from './markdownIt/wikilink'
import { imgResize } from './markdownIt/imgResize'

class Context {
  private md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })

  async setup() {
    await this.setupMd()
  }

  private transformerPerLanguage(): ShikiTransformer {
    let lang: string
    return {
      name: 'transformerPerLanguage',
      preprocess(code, options) {
        lang = options.lang
        return code.replace(/\n$/, '')
      },
      pre(node) {
      // NOTE: This is a css hack to display the language name at the top of the code block
        node.properties['data-lang'] = lang.charAt(0).toUpperCase() + lang.slice(1)
      },
    }
  }

  private async setupMd() {
    const highlighter = await Shiki({
      themes: {
        light: 'solarized-light',
        dark: 'solarized-dark',
      },
      transformers: [
        this.transformerPerLanguage(),
      ],
      cssVariablePrefix: '--s-',
    })

    this.md
      .use(highlighter)
      .use(wikilink)
      .use(imgResize)
  }

  transform(code: string, id: string) {
    if (!id.endsWith('.md'))
      return

    const { content, data } = matter(code)
    const html = this.md.render(content)

    const constants = [
      `const meta = ${JSON.stringify({ ...data, date: data.date ? new Date(data.date).toLocaleDateString() : undefined })};`,
      `const html = ${JSON.stringify(html)};`,
    ]

    return {
      code: `${constants.join('\n')}\nexport { meta, html };`,
      map: null,
    }
  }
}

export default function pageMarkdown(): Plugin {
  let ctx: Context

  return {
    name: 'pkm-plugin-markdown',
    enforce: 'pre',
    async configResolved() {
      ctx = new Context()
      await ctx.setup()
    },
    transform(code, id) {
      return ctx.transform(code, id)
    },
  }
}
