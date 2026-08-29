import type { ReactNode } from 'react'
import ShareLink from './ShareLink'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  /** Widens the column for views that place charts side by side. */
  wide?: boolean
  /** Every view is a link, so the control is on by default. */
  share?: boolean
  children: ReactNode
}

export default function PageLayout({
  title,
  subtitle,
  actions,
  wide = false,
  share = true,
  children,
}: PageLayoutProps) {
  return (
    <div className={wide ? `${styles.page} ${styles.wide}` : styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.actions}>
          {actions}
          {share ? <ShareLink /> : null}
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
