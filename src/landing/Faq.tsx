import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import Reveal from '../shared/components/Reveal'
import SectionHeading from './SectionHeading'
import styles from './Faq.module.css'

// The questions a careful first visitor asks before trusting a number, answered
// in the same plain terms the product uses. Several answers name a limit of the
// product on purpose: saying it here costs less than being caught out later.

const QUESTIONS: { q: TranslationKey; a: TranslationKey }[] = [
  { q: 'faq.sourceQ', a: 'faq.sourceA' },
  { q: 'faq.freeQ', a: 'faq.freeA' },
  { q: 'faq.freshQ', a: 'faq.freshA' },
  { q: 'faq.bandQ', a: 'faq.bandA' },
  { q: 'faq.dailyQ', a: 'faq.dailyA' },
  { q: 'faq.adviceQ', a: 'faq.adviceA' },
]

export default function Faq() {
  const { t } = useI18n()
  // One answer open at a time, the first one to start with, so the section
  // shows what an answer looks like before anyone clicks.
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className={styles.section} id="questions">
      <div className={styles.inner}>
        <SectionHeading index="05" eyebrow={t('faq.eyebrow')} title={t('faq.title')} />

        <Reveal delay={100} className={styles.list}>
          {QUESTIONS.map((item, index) => {
            const expanded = open === index
            const panel = `faq-panel-${index}`
            return (
              <div key={item.q} className={expanded ? `${styles.item} ${styles.open}` : styles.item}>
                <button
                  type="button"
                  className={styles.question}
                  aria-expanded={expanded}
                  aria-controls={panel}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span className={styles.number}>{`0${index + 1}`}</span>
                  <span className={styles.qText}>{t(item.q)}</span>
                  <ChevronDown size={18} strokeWidth={1.75} className={styles.chevron} />
                </button>
                <div id={panel} className={styles.answer} hidden={!expanded}>
                  <p>{t(item.a)}</p>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
