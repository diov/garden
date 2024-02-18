import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'

function render(tokens: Token[], idx: number) {
  const token = tokens[idx]
  const src = token.attrs.find(attr => attr[0] === 'src')[1]
  const url = new URL(src)
  const width = url.searchParams.get('width') ?? 'auto'
  const height = url.searchParams.get('height') ?? 'auto'
  // const style = `width: ${width}; height: ${height};`
  return `<img src="${src}" alt="${token.content}" width=${width} height=${height} />`
}

export function imgResize(md: MarkdownIt) {
  md.renderer.rules.image = render
}
