import '@/style/root.css'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Breadcumb from '@/Components/Breadcrumb'
import Footer from '@/Components/Footer'
import style from '@/style/layout.module.css'

const App: React.FC = () => {
  return (
    <div className={style.app}>
      <Breadcumb />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </div>
  )
}

export default App
