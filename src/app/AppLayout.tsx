import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Scale, TrendingUp, Briefcase, Gauge, Brain, LogOut, House, Globe } from 'lucide-react'
import { signOut } from '../backend/auth'
import { useAuth } from './auth/AuthProvider'
import { Logo } from '../shared/components'
import { CountriesProvider } from '../backend/CountriesProvider'
import { LanguageSwitcher, useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import styles from './AppLayout.module.css'

const navItems: { to: string; icon: typeof Scale; label: TranslationKey; end: boolean }[] = [
  { to: '/app', icon: LayoutDashboard, label: 'nav.dashboard', end: true },
  { to: '/app/sanctions', icon: Scale, label: 'nav.sanctions', end: false },
  { to: '/app/inflation', icon: TrendingUp, label: 'nav.inflation', end: false },
  { to: '/app/unemployment', icon: Briefcase, label: 'nav.unemployment', end: false },
  { to: '/app/quality-of-life', icon: Gauge, label: 'nav.quality', end: false },
  { to: '/app/country', icon: Globe, label: 'nav.country', end: false },
  { to: '/app/ai-explainer', icon: Brain, label: 'nav.ai', end: false },
  { to: '/app/property-lab', icon: House, label: 'nav.property', end: false },
]

export default function AppLayout() {
  const { session } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  async function handleSignOut() {
    navigate('/')
    await signOut()
  }

  return (
    <CountriesProvider>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Logo to="/app" />
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                }
              >
                <item.icon size={17} strokeWidth={1.75} />
                <span>{t(item.label)}</span>
              </NavLink>
            ))}
          </nav>
          <div className={styles.bottom}>
            <LanguageSwitcher />
            <span className={styles.email}>{session?.user.email}</span>
            <button className={styles.signOut} onClick={handleSignOut}>
              <LogOut size={15} strokeWidth={1.75} />
              <span>{t('nav.signOut')}</span>
            </button>
          </div>
        </aside>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </CountriesProvider>
  )
}
