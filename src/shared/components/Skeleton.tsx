import styles from './Skeleton.module.css'

interface SkeletonProps {
  height?: number
  /** Repeats the block, for a grid of panels waiting on one request. */
  count?: number
}

// A grey block in the shape of what is coming. It reads as progress far better
// than a spinner, because the page does not jump once the data lands.
export default function Skeleton({ height = 148, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.block} style={{ height }} aria-hidden="true" />
      ))}
    </>
  )
}
