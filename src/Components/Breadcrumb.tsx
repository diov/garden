import { Link } from 'react-router-dom'
import style from '@/style/layout.module.css'
import logo from '@/assets/logo.svg'

const Breadcumb: React.FC = () => {
  return (
    <header className={style.header}>
      <Link to='/' className={style.brand}>
        <img src={logo} alt='logo'/>
        <strong>Za Wārudo</strong>
      </Link>
      <nav>
        <div>
          <Link to='/posts'>Blog</Link>
        </div>
      </nav>
    </header>
  )
}

export default Breadcumb
