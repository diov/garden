import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import Breadcumb from '@/Components/Breadcrumb'
import appStyle from '@/style/layout.module.css'
import articleStyle from '@/style/article.module.css'
import Footer from '@/Components/Footer'

const NotFound: React.FC = () => {
  const error: any = useRouteError()

  const errorMessage = () => {
    if (isRouteErrorResponse(error))
      return error.statusText
    else
      return error.message
  }

  return (
    <div className={appStyle.app}>
      <Breadcumb />
      <div className={articleStyle.article}>
        <h1>404</h1>
        <p>Oops! Looks like you've stumbled upon a page that doesn't exist.</p>
        <p>
          <i>{error.toString()}</i>
        </p>
      </div>
      <Footer />
    </div>

  )
}

export default NotFound
