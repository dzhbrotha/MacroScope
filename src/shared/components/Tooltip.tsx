import { Info } from 'lucide-react'
import styles from './Tooltip.module.css'

interface TooltipProps {
  text: string
  label: string
}

// Plain language explanation attached to an indicator. Opens on hover and on
// keyboard focus, so it works without a mouse too.
export default function Tooltip({ text, label }: TooltipProps) {
  return (
    <span className={styles.wrap} tabIndex={0} role="note" aria-label={`${label}: ${text}`}>
      <Info size={13} strokeWidth={2} className={styles.icon} aria-hidden="true" />
      <span className={styles.bubble}>{text}</span>
    </span>
  )
}
