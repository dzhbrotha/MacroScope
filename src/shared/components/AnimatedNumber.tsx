import { useEffect, useRef, useState } from 'react'

// Headline figures count up on arrival. It is a small thing, but it tells the
// reader the number just changed, which matters on a board where four panels
// reload at once. Anyone who asked the system for less motion gets none.

const DURATION = 650

function prefersStill() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOut(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
}

export default function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    if (prefersStill()) {
      setShown(value)
      return
    }
    const from = fromRef.current
    const distance = value - from
    if (distance === 0) return

    let frame = 0
    const started = performance.now()
    function step(now: number) {
      const progress = Math.min(1, (now - started) / DURATION)
      setShown(from + distance * easeOut(progress))
      if (progress < 1) frame = requestAnimationFrame(step)
      else fromRef.current = value
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])

  useEffect(() => {
    fromRef.current = shown
  }, [shown])

  return <>{format(shown)}</>
}
