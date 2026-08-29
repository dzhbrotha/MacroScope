import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Menu, Search, X } from 'lucide-react'
import { signOut } from '../backend/auth'
import { useAuth } from './auth/AuthProvider'
import { Logo } from '../shared/components'
import { CountriesProvider } from '../backend/CountriesProvider'
import { WatchlistBar, WatchlistProvider } from '../shared/watchlist'
import { LanguageSwitcher, useI18n } from '../shared/i18n'
import CommandPalette, { PALETTE_EVENT } from './CommandPalette'
import { navItems } from './navItems'
import styles from './AppLayout.module.css'

function shortcutLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl K'
  return /mac/i.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K'
}

export default function AppLayout() {
  const { session } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  // On a phone the nav entries filled more than half the screen, so they
  // collapse behind a button and open on demand.
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    navigate('/')
    await signOut()
  }

  return (
    <CountriesProvider>
      <WatchlistProvider>
        <div className={styles.shell}>
          <aside className={menuOpen ? `${styles.sidebar} ${styles.open}` : styles.sidebar}>
            <div className={styles.head}>
              <Logo to="/app" />
              <button
                type="button"
                className={styles.menuButton}
                aria-expanded={menuOpen}
                aria-controls="app-nav"
                aria-label={t('nav.menu')}
                onClick={() => setMenuOpen((current) => !current)}
              >
                {menuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            </div>

            <button
              type="button"
              className={styles.search}
              onClick={() => window.dispatchEvent(new CustomEvent(PALETTE_EVENT))}
            >
              <Search size={15} strokeWidth={1.75} />
              <span>{t('cmd.open')}</span>
              <kbd className={styles.shortcut}>{shortcutLabel()}</kbd>
            </button>

            <nav className={styles.nav} id="app-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
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
              {session ? (
                <>
                  <span className={styles.email}>{session.user.email}</span>
                  <button className={styles.signOut} onClick={handleSignOut}>
                    <LogOut size={15} strokeWidth={1.75} />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.guest}>{t('nav.guestHint')}</span>
                  <Link to="/signin" className={styles.signOut}>
                    <LogIn size={15} strokeWidth={1.75} />
                    <span>{t('nav.signIn')}</span>
                  </Link>
                </>
              )}
            </div>
          </aside>

          <main className={styles.content}>
            <WatchlistBar />
            <Outlet />
          </main>
        </div>

        <CommandPalette />
      </WatchlistProvider>
    </CountriesProvider>
  )
}
