import type { ReactNode } from 'react'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  /** Widens the column for views that place charts side by side. */
  wide?: boolean
  children: ReactNode
}

export default function PageLayout({
  title,
  subtitle,
  actions,
  wide = false,
  children,
}: PageLayoutProps) {
  return (
    <div className={wide ? `${styles.page} ${styles.wide}` : styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
