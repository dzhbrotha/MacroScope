import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title?: string
  /** Sits on the right of the title rule, for controls that belong to the card. */
  action?: ReactNode
  children: ReactNode
}

export default function Card({ title, action, children }: CardProps) {
  return (
    <div className={styles.card}>
      {title ? (
        <header className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          {action ? <div className={styles.action}>{action}</div> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </div>
  )
}
