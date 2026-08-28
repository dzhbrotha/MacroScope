import { useEffect, useRef } from 'react'
import styles from './ScrollProgress.module.css'

// A hairline that fills as the page is read. On a long landing page it answers
// the one question a scrollbar answers badly on a dark background: how much is
// left. The value is written straight to the style to keep React out of the
// scroll handler.
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const done = scrollable <= 0 ? 0 : window.scrollY / scrollable
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, done))})`
    }
    function onScroll() {
      if (frame === 0) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className={styles.rail} aria-hidden="true">
      <div className={styles.bar} ref={bar} />
    </div>
  )
}
