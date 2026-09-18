import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Database, Languages, Unlock } from 'lucide-react'
import { useI18n } from '../shared/i18n'
import HeroPreview from './HeroPreview'
import type { HeroData } from './useHeroData'
import styles from './Hero.module.css'

/** Faint squared paper behind the opening screen: lines, not a gradient. */
function GraphPaper() {
  return (
    <svg className={styles.paper} aria-hidden="true">
      <defs>
        <pattern id="landing-graph-paper" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--color-surface-2)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#landing-graph-paper)" />
    </svg>
  )
}

/** The key word of the headline, underlined by a stroke that draws itself. */
function Underlined({ children }: { children: ReactNode }) {
  return (
    <span className={styles.underlined}>
      {children}
      <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={styles.stroke} aria-hidden="true">
        <path
          d="M 3 10 C 45 3, 125 2, 197 7"
          pathLength={1}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  )
}

function Chip({ icon: Icon, children }: { icon: ComponentType<{ size?: number; strokeWidth?: number }>; children: ReactNode }) {
  return (
    <li className={styles.chip}>
      <Icon size={13} strokeWidth={2} />
      {children}
    </li>
  )
}

function formatUpdated(stamp: string, lang: string): string {
  const date = new Date(`${stamp}T00:00:00`)
  if (Number.isNaN(date.getTime())) return stamp
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Hero({ data }: { data: HeroData }) {
  const { t, lang } = useI18n()

  return (
    <section className={styles.hero}>
      <GraphPaper />

      <div className={styles.inner}>
        <div className={styles.copy}>
          {/* The pill states a fact the page just checked: the date the World
              Bank last refreshed its database. That is what live means here. */}
          <p className={styles.pill}>
            <span className={styles.ping} aria-hidden="true">
              <i />
              <b />
            </span>
            {data.updated
              ? t('hero.updated', { date: formatUpdated(data.updated, lang) })
              : t('hero.checking')}
          </p>

          <h1 className={styles.title}>
            {t('hero.titleBefore')}
            {/* The word and the stop after it are kept on one line: the underline
                makes the word an inline block, and a line may break after one. */}
            <span className={styles.keep}>
              <Underlined>{t('hero.titleWord')}</Underlined>
              {t('hero.titleAfter')}
            </span>
          </h1>

          <p className={styles.text}>{t('hero.text')}</p>

          <div className={styles.actions}>
            <Link to="/app/board" className={styles.primary}>
              {t('hero.open')}
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link to="/signup" className={styles.secondary}>
              {t('hero.account')}
            </Link>
          </div>

          <ul className={styles.chips}>
            <Chip icon={Check}>{t('hero.chipFree')}</Chip>
            <Chip icon={Unlock}>{t('hero.chipOpen')}</Chip>
            <Chip icon={Languages}>{t('hero.chipLang')}</Chip>
            <Chip icon={Database}>{t('hero.chipSource')}</Chip>
          </ul>
        </div>

        <div className={styles.preview}>
          <HeroPreview data={data} />
        </div>
      </div>
    </section>
  )
}
