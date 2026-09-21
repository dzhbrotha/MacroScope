import Reveal from '../shared/components/Reveal'
import styles from './SectionHeading.module.css'

// A heading split across two columns: the number and the eyebrow sit in a rail
// of their own, the title and the paragraph in the wider one beside it. The
// rail swaps sides from section to section, so the page does not begin every
// block the same way.
export default function SectionHeading({
  index,
  eyebrow,
  title,
  text,
  flip = false,
}: {
  index: string
  eyebrow: string
  title: string
  text?: string
  /** Puts the rail on the right, for sections that follow one that did not. */
  flip?: boolean
}) {
  return (
    <Reveal className={flip ? `${styles.wrap} ${styles.flip}` : styles.wrap}>
      <p className={styles.rail}>
        <span className={styles.index}>{index}</span>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.eyebrow}>{eyebrow}</span>
      </p>
      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>
        {text ? <p className={styles.text}>{text}</p> : null}
      </div>
    </Reveal>
  )
}
