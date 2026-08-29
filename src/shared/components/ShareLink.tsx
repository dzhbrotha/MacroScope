import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { useI18n } from '../i18n'
import styles from './ShareLink.module.css'

// Every module keeps its country, range and units in the address bar, so the
// current view is already a link. This makes that fact visible: without a way
// to hand a view to someone else, a reader cannot pass the product on.
export default function ShareLink() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    trackEvent('share', { path: window.location.pathname })

    // A phone has a share sheet worth using. A desktop does not, so the link
    // goes straight to the clipboard there.
    const handheld =
      typeof navigator.share === 'function' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    if (handheld) {
      try {
        await navigator.share({ title: document.title, url })
        return
      } catch {
        // the sheet was dismissed, fall through to the clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // clipboard access can be refused; the address bar still holds the link
    }
  }

  return (
    <button
      type="button"
      className={copied ? `${styles.share} ${styles.done}` : styles.share}
      onClick={share}
      title={t('share.hint')}
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Share2 size={14} strokeWidth={1.75} />}
      <span>{copied ? t('common.linkCopied') : t('share.button')}</span>
    </button>
  )
}
