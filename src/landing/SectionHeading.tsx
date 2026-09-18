import Reveal from './Reveal'
import styles from './SectionHeading.module.css'

// Every section opens the same way: a numbered eyebrow on a short rule, then
// the title. The numbers give a long page a spine the reader can navigate by.
export default function SectionHeading({
  index,
  eyebrow,
  title,
  text,
}: {
  index: string
  eyebrow: string
  title: string
  text?: string
}) {
  return (
    <Reveal className={styles.wrap}>
      <p className={styles.eyebrow}>
        <span className={styles.index}>{index}</span>
        <span className={styles.rule} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className={styles.title}>{title}</h2>
      {text ? <p className={styles.text}>{text}</p> : null}
    </Reveal>
  )
}
