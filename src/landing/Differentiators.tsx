import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import styles from './Differentiators.module.css'

// The four things the product does that nothing else in the category does,
// each with a small drawing of the idea and a door straight into the module.
// Kept to what was built and checked: no promise here is ahead of the code.

/** A month of work as a ring, with the extra hours as a wedge taken out of it. */
function HoursArt() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      <circle cx="60" cy="40" r="26" className={styles.faint} />
      <path d="M60 40 L60 14 A26 26 0 0 1 84.4 49 Z" className={styles.fill} />
      <circle cx="60" cy="40" r="26" className={styles.line} />
      <path d="M60 40 L60 22" className={styles.line} />
      <path d="M60 40 L72 46" className={styles.line} />
    </svg>
  )
}

/** Stated weight against real influence: the bars that should match and do not. */
function AuditArt() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      {[
        [18, 30, 40],
        [38, 30, 41],
        [58, 20, 13],
        [78, 20, 7],
      ].map(([x, weight, share]) => (
        <g key={x}>
          <rect x={x} y={68 - weight * 1.3} width="7" height={weight * 1.3} className={styles.faintFill} />
          <rect x={x + 9} y={68 - share * 1.3} width="7" height={share * 1.3} className={styles.fill} />
        </g>
      ))}
      <path d="M12 68 H108" className={styles.line} />
    </svg>
  )
}

/** Five pillars of a statistical system, of unequal strength. */
function TrustArt() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      {[100, 90, 79, 80, 75].map((score, index) => (
        <rect
          key={index}
          x={20 + index * 17}
          y={68 - score * 0.52}
          width="10"
          height={score * 0.52}
          className={index === 4 ? styles.fill : styles.faintFill}
        />
      ))}
      <path d="M14 68 H106" className={styles.line} />
    </svg>
  )
}

/** A timeline with the shock marked and the playhead a year past it. */
function ReplayArt() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      <path d="M14 52 H106" className={styles.line} />
      {[14, 32, 50, 68, 86, 104].map((x) => (
        <path key={x} d={`M${x} 48 V56`} className={styles.line} />
      ))}
      <path d="M32 40 L27 32 H37 Z" className={styles.fill} />
      <circle cx="50" cy="52" r="4" className={styles.fill} />
      <path d="M50 52 H14" className={styles.thick} />
      <path d="M54 22 L66 30 L54 38 Z" className={styles.line} />
    </svg>
  )
}

const ITEMS: {
  art: ComponentType
  title: TranslationKey
  text: TranslationKey
  to: string
}[] = [
  { art: HoursArt, title: 'diff.hoursTitle', text: 'diff.hoursText', to: '/app/inflation' },
  { art: AuditArt, title: 'diff.auditTitle', text: 'diff.auditText', to: '/app/quality-of-life' },
  { art: TrustArt, title: 'diff.trustTitle', text: 'diff.trustText', to: '/app/data-trust' },
  { art: ReplayArt, title: 'diff.replayTitle', text: 'diff.replayText', to: '/app/sanctions' },
]

export default function Differentiators() {
  const { t } = useI18n()

  return (
    <section className={styles.section} id="different">
      <div className={styles.inner}>
        <SectionHeading
          index="02"
          eyebrow={t('diff.eyebrow')}
          title={t('diff.title')}
          text={t('diff.text')}
        />

        <div className={styles.grid}>
          {ITEMS.map((item, index) => (
            <Reveal key={item.title} delay={index * 100} className={styles.cell}>
              <Link to={item.to} className={styles.card}>
                <span className={styles.art}>
                  <item.art />
                </span>
                <span className={styles.number}>{`0${index + 1}`}</span>
                <h3 className={styles.title}>{t(item.title)}</h3>
                <p className={styles.text}>{t(item.text)}</p>
                <span className={styles.open}>
                  {t('diff.open')}
                  <ArrowRight size={14} strokeWidth={2} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
