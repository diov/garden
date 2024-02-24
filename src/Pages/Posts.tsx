import matters from 'virtual:pkm'
import { Link } from 'react-router-dom'
import style from '@/style/posts.module.css'

const Posts: React.FC = () => {
  return (
    <ul className={style.postsContainer}>
      {matters.filter(matter => matter.path.startsWith('/posts')).map((matter) => {
        return (
          <li key={matter.path} className={style.postsItem}>
            <Link to={matter.path}>{matter.meta.title}</Link>
            {matter.meta.date && <time>{matter.meta.date}</time>}
          </li>
        )
      })}
    </ul>
  )
}

export default Posts
