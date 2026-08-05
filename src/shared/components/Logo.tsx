import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

export default function Logo({ to = '/', compact = false }: { to?: string; compact?: boolean }) {
  return <Link to={to} className={styles.logo} aria-label="MacroScope home"><span className={styles.mark} aria-hidden="true"><i /><i /><i /></span>{!compact && <span className={styles.name}>MacroScope</span>}</Link>
}
