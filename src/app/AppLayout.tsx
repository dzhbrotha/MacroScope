import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Scale, TrendingUp, Briefcase, Gauge, Brain, LogOut, House } from 'lucide-react'
import { signOut } from '../backend/auth'
import { useAuth } from './auth/AuthProvider'
import { Logo } from '../shared/components'
import styles from './AppLayout.module.css'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/sanctions', icon: Scale, label: 'Sanctions Impact', end: false },
  { to: '/app/inflation', icon: TrendingUp, label: 'Inflation Forecast', end: false },
  { to: '/app/unemployment', icon: Briefcase, label: 'Unemployment', end: false },
  { to: '/app/quality-of-life', icon: Gauge, label: 'Quality of Life', end: false },
  { to: '/app/ai-explainer', icon: Brain, label: 'AI Crisis Explainer', end: false },
  { to: '/app/property-lab', icon: House, label: 'Property Lab', end: false },
]

export default function AppLayout() {
  const { session } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    navigate('/')
    await signOut()
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Logo to="/app" />
        <nav className={styles.nav}>{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}><item.icon size={17} strokeWidth={1.75} /><span>{item.label}</span></NavLink>)}</nav>
        <div className={styles.bottom}>
          <span className={styles.email}>{session?.user.email}</span>
          <button className={styles.signOut} onClick={handleSignOut}>
            <LogOut size={15} strokeWidth={1.75} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
