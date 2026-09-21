import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '../shared/i18n'
import Reveal from '../shared/components/Reveal'
import styles from './Closing.module.css'

/** The mark of the logo, as outline strokes, large and faint. */
function MarkWatermark() {
  return (
    <svg viewBox="0 0 24 22" className={styles.watermark} aria-hidden="true">
      <path d="M1.6 2.6 L7 15.6 L12 6 L17 15.6 L22.4 2.6" />
      <path d="M8.6 19.6 H15.4" />
    </svg>
  )
}

// The last screen is a single band of the deep red with white type on it,
// which is the one pairing in the palette that clears the contrast bar at 6.2.
// It says the one thing the page has been building to: the product is already
// open, so the next step costs nothing.
export default function Closing() {
  const { t } = useI18n()

  return (
    <section className={styles.band}>
      <MarkWatermark />
      <div className={styles.inner}>
        <Reveal>
          <h2 className={styles.title}>{t('closing.title')}</h2>
          <p className={styles.text}>{t('closing.text')}</p>
          <div className={styles.actions}>
            <Link to="/app/board" className={styles.primary}>
              {t('hero.open')}
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link to="/signup" className={styles.secondary}>
              {t('hero.account')}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
