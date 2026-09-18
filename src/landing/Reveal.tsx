import type { ReactNode } from 'react'
import { usePrefersReducedMotion, useSeenOnce, useStartedHidden } from './motion'
import styles from './Reveal.module.css'

/**
 * Lets a block rise into place the first time it scrolls into view. With
 * reduced motion requested it is simply there, and nothing is hidden in a way
 * that depends on an animation finishing.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  // Both hooks are called every time, whatever the first one says.
  const reduced = usePrefersReducedMotion()
  const startedHidden = useStartedHidden()
  const still = reduced || startedHidden
  const { ref, seen } = useSeenOnce<HTMLDivElement>()

  const state = still ? '' : seen ? styles.shown : styles.waiting
  return (
    <div
      ref={ref}
      style={seen && !still && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      className={[state, className].filter(Boolean).join(' ') || undefined}
    >
      {children}
    </div>
  )
}
