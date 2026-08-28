import { Star } from 'lucide-react'
import { useI18n } from '../i18n'
import { useWatchlist, WATCHLIST_MAX } from './WatchlistProvider'
import styles from './PinButton.module.css'

// Pins the country currently on screen. Sits next to the picker in every module
// so the watchlist is built while reading, not on a settings page.
export default function PinButton({ code }: { code: string }) {
  const { t } = useI18n()
  const { has, toggle, full } = useWatchlist()

  if (!code) return null

  const pinned = has(code)
  const blocked = !pinned && full

  return (
    <button
      type="button"
      className={pinned ? `${styles.pin} ${styles.on}` : styles.pin}
      onClick={() => toggle(code)}
      disabled={blocked}
      title={
        blocked
          ? t('watch.full', { max: WATCHLIST_MAX })
          : pinned
            ? t('watch.unpin')
            : t('watch.pin')
      }
      aria-pressed={pinned}
    >
      <Star size={14} strokeWidth={2} fill={pinned ? 'currentColor' : 'none'} />
      <span>{pinned ? t('watch.pinned') : t('watch.pin')}</span>
    </button>
  )
}
