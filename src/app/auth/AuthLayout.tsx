import type { ReactNode } from 'react'
import styles from './AuthLayout.module.css'
import { Logo } from '../../shared/components'

interface AuthLayoutProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <Logo />
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </div>
      <p className={styles.footer}>{footer}</p>
    </div>
  )
}
