import { useEffect, useRef, useState } from 'react'

// The small amount of motion machinery the landing page uses. No animation
// library: everything that moves is CSS, and these hooks only decide when it
// starts, whether it may, and when to stop spending effort on it.
//
// The same rules as the olympiad site, because they were learned the hard way
// there: nothing may stay hidden waiting on an event that never arrives.

const REDUCED = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(REDUCED).matches === true,
  )

  useEffect(() => {
    const query = window.matchMedia?.(REDUCED)
    if (!query) return
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Whether the page was opened in a tab nobody was looking at. Such a document
 * runs no animation frames and receives no intersection events until it is
 * shown, so anything waiting on either would sit hidden. Those pages are simply
 * drawn finished.
 */
export function useStartedHidden(): boolean {
  const [hidden] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
  )
  return hidden
}

/**
 * True from the first moment the element is on screen, and true from then on,
 * so a section animates in once rather than every time it is scrolled past.
 * Without an IntersectionObserver, or on a page that never reports, the answer
 * is simply yes.
 */
export function useSeenOnce<T extends Element>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T | null>(null)
  const startedHidden = useStartedHidden()
  const [seen, setSeen] = useState(startedHidden)

  useEffect(() => {
    if (seen) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    let reported = false
    const observer = new IntersectionObserver(
      (entries) => {
        reported = true
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0.12 },
    )
    observer.observe(node)
    // An observer always reports once, on the frame after it starts watching.
    // A page that never gets that report is not being drawn at all and would
    // otherwise keep its content hidden for good.
    const unreported = setTimeout(() => {
      if (reported) return
      setSeen(true)
      observer.disconnect()
    }, 1500)
    return () => {
      observer.disconnect()
      clearTimeout(unreported)
    }
  }, [rootMargin, seen])

  return { ref, seen }
}

/**
 * True while the element is on screen and the tab is in front. Looping
 * animations pause otherwise, so a landing page left open costs nothing.
 */
export function useWatched<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [onScreen, setOnScreen] = useState(false)
  const [tabVisible, setTabVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  )

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return { ref, watched: onScreen && tabVisible }
}

/**
 * Counts from zero up to a number once `start` turns true. Shows the number
 * outright when motion is reduced or the page opened where nobody could watch.
 */
export function useCountUp(target: number, start: boolean, durationMs = 1400): number {
  const reduced = usePrefersReducedMotion()
  const startedHidden = useStartedHidden()
  const instant = reduced || startedHidden
  const [value, setValue] = useState(() => (instant ? target : 0))

  useEffect(() => {
    if (instant) {
      setValue(target)
      return
    }
    if (!start) return
    let frame = 0
    const began = performance.now()
    const step = (time: number) => {
      const progress = Math.min(1, (time - began) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    // A hidden tab runs no animation frames, so the true number is put in place
    // once the count should have finished, frames or not.
    const settle = setTimeout(() => {
      cancelAnimationFrame(frame)
      setValue(target)
    }, durationMs + 250)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
  }, [durationMs, instant, start, target])

  return value
}
