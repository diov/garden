import { type RouteObject } from 'react-router-dom'
import matters from 'virtual:pkm'
import Article from './Components/Article'
import Posts from '@/Pages/Posts'
import App from '@/Pages/App'
import NotFound from '@/Pages/404'

export async function generateRoutes() {
  const articles = []
  articles.push({
    path: '/posts',
    element: <Posts />,
  } as RouteObject)

  console.log(matters)
  const globs = import.meta.glob('../articles/**/*.md')
  for (const key in globs) {
    const matter = matters.find(matter => matter.file === key)
    if (!matter)
      continue

    const { html } = (await globs[key]()) as { html: string; meta: any }
    articles.push({
      path: matter.path,
      file: key,
      element: <Article matter={matter} html={html} />,
    } as RouteObject)
  }

  const route = [
    {
      path: '/',
      element: <App />,
      errorElement: <NotFound />,
      children: articles,
    } as RouteObject,
    {
      path: '404',
      element: <NotFound />,
    },
  ]

  return route
}
