import { Sparkles } from 'lucide-react'
import styles from './InsightList.module.css'

interface InsightListProps {
  title: string
  items: string[]
}

export default function InsightList({ title, items }: InsightListProps) {
  if (items.length === 0) return null
  return (
    <div className={styles.box}>
      <span className={styles.title}>
        <Sparkles size={15} strokeWidth={1.75} />
        {title}
      </span>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
