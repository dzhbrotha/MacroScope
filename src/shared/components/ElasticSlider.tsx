import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, PointerEvent } from 'react'
import styles from './ElasticSlider.module.css'

type ElasticSliderProps = { value?: number; defaultValue?: number; startingValue?: number; maxValue?: number; isStepped?: boolean; stepSize?: number; leftIcon?: ReactNode; rightIcon?: ReactNode; onChange?: (value: number) => void }
const MAX_OVERFLOW = 50

export default function ElasticSlider({ value, defaultValue = 50, startingValue = 0, maxValue = 100, isStepped = false, stepSize = 1, leftIcon = '−', rightIcon = '+', onChange }: ElasticSliderProps) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue)
  const sliderRef = useRef<HTMLDivElement>(null)
  const clientX = useMotionValue(0)
  const overflow = useMotionValue(0)
  const scale = useMotionValue(1)
  const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle')
  const currentValue = value ?? internalValue

  useEffect(() => { if (value !== undefined) setInternalValue(value) }, [value])
  useMotionValueEvent(clientX, 'change', (latest) => { if (!sliderRef.current) return; const { left, right } = sliderRef.current.getBoundingClientRect(); const distance = latest < left ? left - latest : latest > right ? latest - right : 0; setRegion(latest < left ? 'left' : latest > right ? 'right' : 'middle'); overflow.jump(decay(distance, MAX_OVERFLOW)) })

  const getValue = (client: number) => {
    if (!sliderRef.current) return currentValue
    const { left, width } = sliderRef.current.getBoundingClientRect()
    let next = startingValue + ((client - left) / width) * (maxValue - startingValue)
    if (isStepped) next = Math.round(next / stepSize) * stepSize
    return Math.min(Math.max(next, startingValue), maxValue)
  }
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => { if (event.buttons === 0) return; const next = getValue(event.clientX); setInternalValue(next); onChange?.(next); clientX.jump(event.clientX) }
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => { event.currentTarget.setPointerCapture(event.pointerId); const next = getValue(event.clientX); setInternalValue(next); onChange?.(next); clientX.jump(event.clientX) }
  const percentage = maxValue === startingValue ? 0 : ((currentValue - startingValue) / (maxValue - startingValue)) * 100

  return <div className={styles.container}><motion.div className={styles.wrapper} onHoverStart={() => animate(scale, 1.12)} onHoverEnd={() => animate(scale, 1)} style={{ scale, opacity: useTransform(scale, [1, 1.12], [.72, 1]) }}><motion.span animate={{ scale: region === 'left' ? [1, 1.3, 1] : 1 }} style={{ x: useTransform(() => region === 'left' ? -overflow.get() / scale.get() : 0) }}>{leftIcon}</motion.span><div ref={sliderRef} className={styles.root} onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} onPointerUp={() => animate(overflow, 0, { type: 'spring', bounce: .5 })} onPointerCancel={() => animate(overflow, 0, { type: 'spring', bounce: .5 })}><motion.div className={styles.trackWrapper} style={{ scaleX: useTransform(() => sliderRef.current ? 1 + overflow.get() / sliderRef.current.getBoundingClientRect().width : 1), scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, .8]), transformOrigin: useTransform(() => clientX.get() < (sliderRef.current?.getBoundingClientRect().left ?? 0) + (sliderRef.current?.getBoundingClientRect().width ?? 0) / 2 ? 'right' : 'left') }}><div className={styles.track}><div className={styles.range} style={{ width: `${percentage}%` }} /></div></motion.div></div><motion.span animate={{ scale: region === 'right' ? [1, 1.3, 1] : 1 }} style={{ x: useTransform(() => region === 'right' ? overflow.get() / scale.get() : 0) }}>{rightIcon}</motion.span></motion.div><output className={styles.value}>{Math.round(currentValue)}</output></div>
}

function decay(value: number, max: number) { if (!max) return 0; return (2 * (1 / (1 + Math.exp(-(value / max))) - .5)) * max }
