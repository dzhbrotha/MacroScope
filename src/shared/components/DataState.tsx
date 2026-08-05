import { Loader2, AlertTriangle, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Button from './Button'
import styles from './DataState.module.css'

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className={styles.state}>
      <Loader2 size={20} strokeWidth={1.75} className={styles.spinner} />
      <p className={styles.text}>{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.state}>
      <AlertTriangle size={20} strokeWidth={1.75} className={styles.errorIcon} />
      <p className={styles.text}>{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState({ message = 'No data available', icon: Icon = Inbox }: { message?: string; icon?: LucideIcon }) {
  return (
    <div className={styles.state}>
      <Icon size={20} strokeWidth={1.75} className={styles.emptyIcon} />
      <p className={styles.text}>{message}</p>
    </div>
  )
}
