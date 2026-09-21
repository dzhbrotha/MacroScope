import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../shared/components'
import { Logo } from '../shared/components'
import { LanguageSwitcher, useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import { navItems } from '../app/navItems'
import ScrollProgress from './ScrollProgress'
import PulseSpark from './PulseSpark'
import PulseBars from './PulseBars'
import Hero from './Hero'
import StatsBand from './StatsBand'
import Differentiators from './Differentiators'
import Faq from './Faq'
import TickerTape from './TickerTape'
import WorldPulse from './WorldPulse'
import Closing from './Closing'
import Reveal from '../shared/components/Reveal'
import SectionHeading from './SectionHeading'
import { useHeroData } from './useHeroData'
import { useLivePulse } from './useLivePulse'
import styles from './LandingPage.module.css'

// Every module the app has, described in the same words the dashboard uses, so
// the landing page cannot advertise a module that no longer exists or miss one
// that was just added.
const MODULE_TEXT: Record<string, TranslationKey> = {
  '/app/board': 'dash.board',
  '/app/sanctions': 'dash.sanctions',
  '/app/inflation': 'dash.inflation',
  '/app/unemployment': 'dash.unemployment',
  '/app/quality-of-life': 'dash.quality',
  '/app/data-trust': 'dash.trust',
  '/app/country': 'dash.country',
  '/app/ai-explainer': 'dash.ai',
  '/app/property-lab': 'dash.property',
}

const MODULES = navItems.filter((item) => item.to in MODULE_TEXT)

const PULSE_LABEL: Record<string, TranslationKey> = {
  inflation: 'ind.inflation',
  unemployment: 'ind.unemployment',
  gdpGrowth: 'ind.gdpGrowth',
}

const audiences: [TranslationKey, TranslationKey][] = [
  ['land.aud1', 'land.aud1x'],
  ['land.aud2', 'land.aud2x'],
  ['land.aud3', 'land.aud3x'],
]

export default function LandingPage() {
  const { t } = useI18n()
  const pulse = useLivePulse()
  const hero = useHeroData()

  return (
    <div>
      <ScrollProgress />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo />
          <nav className={styles.nav}>
            <a href="#why" className={`${styles.navLink} ${styles.anchorLink}`}>{t('land.navWhy')}</a>
            <a href="#different" className={`${styles.navLink} ${styles.anchorLink}`}>{t('diff.eyebrow')}</a>
            <a href="#explore" className={`${styles.navLink} ${styles.anchorLink}`}>{t('land.navExplore')}</a>
            <a href="#questions" className={`${styles.navLink} ${styles.anchorLink}`}>{t('faq.eyebrow')}</a>
            <Link to="/signin" className={styles.navLink}>{t('land.navSignIn')}</Link>
            <LanguageSwitcher />
            <ButtonLink to="/app/board" variant="accent">{t('land.navStart')}</ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        <Hero data={hero} />
        <TickerTape />
        <StatsBand data={hero} />

        <section className={styles.storySection} id="why">
          <div className={styles.storyVisual}>
            <div className={styles.visualWindow}>
              <div className={styles.visualTop}><span>{t('land.fieldNote')}</span><span>01 / 03</span></div>
              <div className={styles.visualTitle}>{t('land.visualTitle')}</div>
              {pulse.history.length > 3 ? (
                <PulseSpark points={pulse.history} />
              ) : (
                <div className={styles.visualChart}><i /><i /><i /><i /><i /><b /></div>
              )}
              <div className={styles.visualReadout}>
                <span>{t('land.visualSignal')}</span>
                <strong>{t('land.visualStrong')}</strong>
              </div>
            </div>
          </div>
          <div className={styles.storyCopy}>
            <article>
              <Reveal>
                <span className={styles.storyNumber}>01</span>
                <p className={styles.kicker}>{t('land.problemKicker')}</p>
                <h2>{t('land.problemTitle')}</h2>
                <p>{t('land.problemText')}</p>
              </Reveal>
            </article>
            <article>
              <Reveal>
                <span className={styles.storyNumber}>02</span>
                <p className={styles.kicker}>{t('land.answerKicker')}</p>
                <h2>{t('land.answerTitle')}</h2>
                <p>{t('land.answerText')}</p>
              </Reveal>
            </article>
            <article>
              <Reveal>
                <span className={styles.storyNumber}>03</span>
                <p className={styles.kicker}>{t('land.resultKicker')}</p>
                <h2>{t('land.resultTitle')}</h2>
                <p>{t('land.resultText')}</p>
                <ButtonLink to="/app/board" variant="accent">{t('hero.open')}</ButtonLink>
              </Reveal>
            </article>
          </div>
        </section>

        <WorldPulse />
        <Differentiators />

        <section className={styles.widgetSection} id="explore">
          <div className={styles.widgetHeader}>
            <SectionHeading index="03" eyebrow={t('land.insideKicker')} title={t('land.insideTitle')} />
            <span className={styles.widgetStamp}>{t('land.stamp')}</span>
          </div>
          <div className={styles.widgetGrid}>
            <Reveal className={`${styles.widget} ${styles.widgetWide}`}>
              <div className={styles.widgetTop}>
                <span>{t('land.pulse')}</span>
                <span className={styles.widgetTag}>
                  {pulse.ready ? t('land.liveIndicators') : t('land.sampleIndicators')}
                </span>
              </div>
              <div className={styles.signalRows}>
                {pulse.ready ? (
                  pulse.rows.map((row) => {
                    const welcome = row.delta === null ? null : (row.delta >= 0) === row.goodWhenUp
                    return (
                      <div key={row.key}>
                        <span>{t(PULSE_LABEL[row.key])}</span>
                        <strong>{`${row.value.toFixed(1)}%`}</strong>
                        <em className={welcome === null ? undefined : welcome ? styles.good : styles.bad}>
                          {row.delta === null
                            ? t('land.watching')
                            : `${row.delta >= 0 ? '+' : '−'} ${Math.abs(row.delta).toFixed(1)} pp`}
                        </em>
                      </div>
                    )
                  })
                ) : (
                  <>
                    <div><span>{t('ind.inflation')}</span><strong>3.2%</strong><em className={styles.down}>− 0.4%</em></div>
                    <div><span>{t('ind.unemployment')}</span><strong>4.1%</strong><em>+ 0.2%</em></div>
                    <div><span>{t('land.policyRate')}</span><strong>5.25%</strong><em>{t('land.watching')}</em></div>
                  </>
                )}
              </div>
              {pulse.growth.length > 3 ? <PulseBars points={pulse.growth} /> : null}

              <p className={styles.widgetNote}>
                {pulse.ready
                  ? t('land.pulseLive', {
                      country: t('land.pulseCountry'),
                      year: pulse.rows[0].year,
                    })
                  : t('land.pulseNote')}
              </p>
            </Reveal>
            <Reveal delay={100} className={styles.widget}>
              <div className={styles.widgetTop}>
                <span>{t('nav.property')}</span>
                <span className={styles.widgetIcon}>↗</span>
              </div>
              <strong className={styles.widgetNumber}>$186</strong>
              <span className={styles.widgetLabel}>{t('land.labCashLabel')}</span>
              <div className={styles.miniBar}><i /></div>
              <Link to="/app/property-lab">{t('land.labOpen')} →</Link>
            </Reveal>
            <Reveal delay={200} className={styles.widget}>
              <div className={styles.widgetTop}>
                <span>{t('land.pathTitle')}</span>
                <span className={styles.widgetTag}>{t('land.pathTag')}</span>
              </div>
              <strong className={styles.widgetNumber}>03 / 10</strong>
              <span className={styles.widgetLabel}>{t('land.pathLabel')}</span>
              <div className={styles.lessonList}><span>NOI</span><span>Cap rate</span><span>DSCR</span></div>
              <Link to="/app/property-lab">{t('land.pathStart')} →</Link>
            </Reveal>
            <Reveal delay={300} className={`${styles.widget} ${styles.widgetDark}`}>
              <div className={styles.widgetTop}><span>{t('land.nextQuestion')}</span><span>MacroScope</span></div>
              <p>«{t('land.questionQuote')}»</p>
              <Link to="/app/property-lab">{t('land.buildScenario')} →</Link>
            </Reveal>
          </div>
        </section>

        <section className={styles.section} id="modules">
          <div className={styles.sectionInner}>
            <SectionHeading index="04" eyebrow={t('land.offerKicker')} title={t('land.offerTitle')} />
            <div className={styles.modulesGrid}>
              {MODULES.map((module, index) => (
                <Reveal key={module.to} delay={(index % 3) * 90}>
                  <Link to={module.to} className={styles.moduleCard}>
                    <module.icon className={styles.moduleIcon} size={22} strokeWidth={1.5} />
                    <h3 className={styles.moduleTitle}>{t(module.label)}</h3>
                    <p className={styles.moduleText}>{t(MODULE_TEXT[module.to])}</p>
                    <span className={styles.moduleOpen}>
                      {t('diff.open')}
                      <ArrowRight size={13} strokeWidth={2} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.featureSection}`} id="property">
          <div className={styles.feature}>
            <Reveal>
              <p className={styles.kicker}>{t('land.propKicker')}</p>
              <h2 className={styles.featureTitle}>{t('land.propTitle')}</h2>
              <p className={styles.featureText}>{t('land.propText')}</p>
              <ButtonLink to="/app/property-lab" variant="accent">{t('land.propCta')}</ButtonLink>
            </Reveal>
            <Reveal delay={150} className={styles.labPreview}>
              <span>{t('land.labSample')}</span>
              <strong>{t('land.labScenario')}</strong>
              <div className={styles.previewLine}><span>{t('land.labCash')}</span><b>− $186</b></div>
              <div className={styles.previewLine}><span>DSCR</span><b>0.94x</b></div>
              <div className={styles.previewLine}><span>{t('land.labNote')}</span><b>{t('land.labNoteValue')} →</b></div>
            </Reveal>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>{t('land.madeFor')}</p>
            <div className={styles.audienceGrid}>
              {audiences.map(([title, text], index) => (
                <Reveal key={title} delay={index * 100}>
                  <span className={styles.index}>0{index + 1}</span>
                  <h3 className={styles.moduleTitle}>{t(title)}</h3>
                  <p className={styles.moduleText}>{t(text)}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Faq />
        <Closing />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Logo />
          <span>{t('land.footer')}</span>
        </div>
      </footer>
    </div>
  )
}
