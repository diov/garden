import type MarkdownIt from 'markdown-it'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'
import type Token from 'markdown-it/lib/token'

function ruler(state: StateInline) {
  const srcText = state.src.substring(state.pos)
  if (srcText.startsWith('[[')) {
    const end = srcText.indexOf(']]')
    if (end !== -1) {
      const token = state.push('wikilink', '', 0)
      const splitIndex = srcText.indexOf('|')
      if (splitIndex !== -1) {
        token.content = srcText.substring(splitIndex + 1, end)
        token.attrs = [['href', srcText.substring(2, splitIndex)]]
      }
      else { token.content = srcText.substring(2, end) }

      token.markup = 'wikilink'
      token.map = [state.pos, state.pos + end + 2]
      state.pos += end + 2
      return true
    }
  }
  return false
}

function render(tokens: Token[], idx: number, _: MarkdownIt.Options) {
  const token = tokens[idx]
  const content = token.content
  let href = ''
  if (token.attrs)
    href = token.attrs.find(attr => attr[0] === 'href')[1]
  else
    href = content

  return `<a href="${href}" title="${content}">[[${content}]]</a>`
}

export function wikilink(md: MarkdownIt) {
  md.inline.ruler.after('text', 'wikilink', ruler)
  md.renderer.rules.wikilink = render
}
