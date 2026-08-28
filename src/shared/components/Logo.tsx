import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

// The mark is an M cut from two strokes, with a rule underneath standing for
// the baseline every reading is measured against. It is drawn in currentColor
// so one file serves the sidebar, the landing header and the dark app tile.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.6 2.6 L7 15.6 L12 6 L17 15.6 L22.4 2.6" />
      <path d="M8.6 19.6 H15.4" />
    </svg>
  )
}

export default function Logo({ to = '/', compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className={styles.logo} aria-label="MacroScope home">
      <LogoMark className={styles.mark} />
      {!compact && <span className={styles.name}>MacroScope</span>}
    </Link>
  )
}
