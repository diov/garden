declare module 'virtual:pkm' {
  export interface Backlink {
    link: string
    title: string
  }
  export interface PageMatter {
    file: string
    path: string
    meta: {
      title: string
      date: string
      [key: string]: any
    }
    backlinks: Backlink[]
  }

  const matters: PageMatter[]
  export default matters
}

declare module '*.md' {
  const meta: {
    title: string
    date: Date
    [key: string]: any
  }
  const html: string

  export { meta, html }
}
