import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Database, Unlock } from 'lucide-react'
import { Logo } from '../../shared/components'
import { LogoMark } from '../../shared/components/Logo'
import { LanguageSwitcher, useI18n } from '../../shared/i18n'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

// The form on one side, the reason you may not need it on the other.
//
// The modules opened to everyone, so the honest thing for this screen to say is
// that an account is optional: it keeps the question history in the explainer
// and nothing else. The panel says so and offers the way straight in.
export default function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  const { t } = useI18n()

  return (
    <div className={styles.page}>
      <div className={styles.formSide}>
        <div className={styles.head}>
          <Logo />
          <LanguageSwitcher />
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>{title}</h1>
          {children}
          <p className={styles.footer}>{footer}</p>
        </div>

        <span className={styles.spacer} />
      </div>

      <aside className={styles.panel}>
        <LogoMark className={styles.watermark} />
        <div className={styles.panelInner}>
          <p className={styles.panelKicker}>{t('auth.panelKicker')}</p>
          <p className={styles.panelTitle}>{t('auth.panelTitle')}</p>
          <p className={styles.panelText}>{t('auth.panelText')}</p>

          <ul className={styles.chips}>
            <li>
              <Check size={13} strokeWidth={2} />
              {t('hero.chipFree')}
            </li>
            <li>
              <Unlock size={13} strokeWidth={2} />
              {t('hero.chipOpen')}
            </li>
            <li>
              <Database size={13} strokeWidth={2} />
              {t('hero.chipSource')}
            </li>
          </ul>

          <Link to="/app/board" className={styles.panelLink}>
            {t('hero.open')}
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </aside>
    </div>
  )
}
