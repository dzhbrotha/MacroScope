import { Loader2, AlertTriangle, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Button from './Button'
import { useI18n } from '../i18n'
import styles from './DataState.module.css'

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n()
  return (
    <div className={styles.state}>
      <Loader2 size={20} strokeWidth={1.75} className={styles.spinner} />
      <p className={styles.text}>{label ?? t('common.loading')}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n()
  return (
    <div className={styles.state}>
      <AlertTriangle size={20} strokeWidth={1.75} className={styles.errorIcon} />
      <p className={styles.text}>{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState({ message, icon: Icon = Inbox }: { message?: string; icon?: LucideIcon }) {
  const { t } = useI18n()
  return (
    <div className={styles.state}>
      <Icon size={20} strokeWidth={1.75} className={styles.emptyIcon} />
      <p className={styles.text}>{message ?? t('common.noData')}</p>
    </div>
  )
}
