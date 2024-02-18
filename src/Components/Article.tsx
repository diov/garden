import type { HTMLReactParserOptions } from 'html-react-parser'
import parse from 'html-react-parser'
import type { PageMatter } from 'virtual:pkm'
import style from '@/style/article.module.css'

interface ArticleProps {
  matter: PageMatter
  html: string
}

const Article: React.FC<ArticleProps> = ({ matter, html }) => {
  const option = {
    replace(domNode) {
    },
  } as HTMLReactParserOptions
  const parseInnerContent = (content: string) => {
    return parse(content, option)
  }

  const timestamp = () => {
    if (matter.meta.date) {
      const date = new Date(matter.meta.date)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }
  }

  return (
    <>
      <article className={style.article}>
        <div className={style.articleHeader}>
          <h1 className={style.articleTitle}>{matter.meta.title}</h1>
          {timestamp()
          && <time className={style.articleDate}>{timestamp()}</time>}
        </div>
        {parseInnerContent(html)}
      </article>
    </>
  )
}

export default Article
