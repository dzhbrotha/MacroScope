import { Link } from 'react-router-dom'
import { Scale, TrendingUp, Briefcase, Gauge, Brain, Database, Zap, Lock } from 'lucide-react'
import { ButtonLink } from '../shared/components'
import { Logo } from '../shared/components'
import { LanguageSwitcher, useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import ScrollProgress from './ScrollProgress'
import PulseSpark from './PulseSpark'
import PulseBars from './PulseBars'
import { useLivePulse } from './useLivePulse'
import styles from './LandingPage.module.css'

const modules: { icon: typeof Scale; title: TranslationKey; text: TranslationKey }[] = [
  { icon: Scale, title: 'nav.sanctions', text: 'land.mod1' },
  { icon: TrendingUp, title: 'nav.inflation', text: 'land.mod2' },
  { icon: Briefcase, title: 'nav.unemployment', text: 'land.mod3' },
  { icon: Gauge, title: 'nav.quality', text: 'land.mod4' },
  { icon: Brain, title: 'nav.ai', text: 'land.mod5' },
]

const steps: { icon: typeof Database; title: TranslationKey; text: TranslationKey }[] = [
  { icon: Database, title: 'land.step1', text: 'land.step1x' },
  { icon: Zap, title: 'land.step2', text: 'land.step2x' },
  { icon: Lock, title: 'land.step3', text: 'land.step3x' },
]

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

  return (
    <div>
      <ScrollProgress />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo />
          <nav className={styles.nav}>
            <a href="#why" className={styles.navLink}>{t('land.navWhy')}</a>
            <a href="#explore" className={styles.navLink}>{t('land.navExplore')}</a>
            <a href="#property" className={styles.navLink}>{t('land.navProperty')}</a>
            <Link to="/signin" className={styles.navLink}>{t('land.navSignIn')}</Link>
            <LanguageSwitcher />
            <ButtonLink to="/signup" variant="accent">{t('land.navStart')}</ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        <section className={`${styles.hero} ${styles.stars}`}>
          <div className={styles.heroTop}>
            <p className={styles.kicker}>{t('land.kicker')}</p>
            <span className={styles.status}><i /> {t('land.status')}</span>
          </div>
          <h1 className={styles.heroTitle}>{t('land.heroTitle')}</h1>
          <p className={styles.heroText}>{t('land.heroText')}</p>
          <div className={styles.heroActions}>
            <ButtonLink to="/signup" variant="accent">{t('land.heroEnter')}</ButtonLink>
            <ButtonLink to="/app/board" variant="secondary">
              {t('land.heroOpen')}
            </ButtonLink>
          </div>
          <div className={styles.signalRail}>
            <div><span>{t('land.rail1')}</span><strong>{t('land.rail1v')}</strong></div>
            <div><span>{t('land.rail2')}</span><strong>{t('nav.country')}</strong></div>
            <div><span>{t('land.rail3')}</span><strong>{t('land.rail3v')}</strong></div>
          </div>
        </section>

        <section className={styles.storySection} id="why">
          <div className={styles.storyVisual}>
            <div className={styles.visualWindow}>
              <div className={styles.visualTop}><span>{t('land.fieldNote')}</span><span>01—03</span></div>
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
              <span className={styles.storyNumber}>01</span>
              <p className={styles.kicker}>{t('land.problemKicker')}</p>
              <h2>{t('land.problemTitle')}</h2>
              <p>{t('land.problemText')}</p>
            </article>
            <article>
              <span className={styles.storyNumber}>02</span>
              <p className={styles.kicker}>{t('land.answerKicker')}</p>
              <h2>{t('land.answerTitle')}</h2>
              <p>{t('land.answerText')}</p>
            </article>
            <article>
              <span className={styles.storyNumber}>03</span>
              <p className={styles.kicker}>{t('land.resultKicker')}</p>
              <h2>{t('land.resultTitle')}</h2>
              <p>{t('land.resultText')}</p>
              <ButtonLink to="/signup" variant="accent">{t('land.resultCta')}</ButtonLink>
            </article>
          </div>
        </section>

        <section className={styles.widgetSection} id="explore">
          <div className={styles.widgetHeader}>
            <div>
              <p className={styles.kicker}>{t('land.insideKicker')}</p>
              <h2 className={styles.sectionTitle}>{t('land.insideTitle')}</h2>
            </div>
            <span className={styles.widgetStamp}>{t('land.stamp')}</span>
          </div>
          <div className={styles.widgetGrid}>
            <article className={`${styles.widget} ${styles.widgetWide}`}>
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
            </article>
            <article className={styles.widget}>
              <div className={styles.widgetTop}>
                <span>{t('nav.property')}</span>
                <span className={styles.widgetIcon}>↗</span>
              </div>
              <strong className={styles.widgetNumber}>$186</strong>
              <span className={styles.widgetLabel}>{t('land.labCashLabel')}</span>
              <div className={styles.miniBar}><i /></div>
              <a href="/signup">{t('land.labOpen')} →</a>
            </article>
            <article className={styles.widget}>
              <div className={styles.widgetTop}>
                <span>{t('land.pathTitle')}</span>
                <span className={styles.widgetTag}>{t('land.pathTag')}</span>
              </div>
              <strong className={styles.widgetNumber}>03 / 10</strong>
              <span className={styles.widgetLabel}>{t('land.pathLabel')}</span>
              <div className={styles.lessonList}><span>NOI</span><span>Cap rate</span><span>DSCR</span></div>
              <a href="/signup">{t('land.pathStart')} →</a>
            </article>
            <article className={`${styles.widget} ${styles.widgetDark}`}>
              <div className={styles.widgetTop}><span>{t('land.nextQuestion')}</span><span>MacroScope</span></div>
              <p>«{t('land.questionQuote')}»</p>
              <a href="/signup">{t('land.buildScenario')} →</a>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.statement}>
            <div>
              <p className={styles.kicker}>{t('land.whoKicker')}</p>
              <h2 className={styles.sectionTitle}>{t('land.whoTitle')}</h2>
            </div>
            <p>{t('land.whoText')}</p>
          </div>
        </section>

        <section className={styles.section} id="modules">
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>{t('land.offerKicker')}</p>
            <h2 className={styles.sectionTitle}>{t('land.offerTitle')}</h2>
            <div className={styles.modulesGrid}>
              {modules.map((module) => (
                <article key={module.title} className={styles.moduleCard}>
                  <module.icon className={styles.moduleIcon} size={22} strokeWidth={1.5} />
                  <h3 className={styles.moduleTitle}>{t(module.title)}</h3>
                  <p className={styles.moduleText}>{t(module.text)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.featureSection}`} id="property">
          <div className={styles.feature}>
            <div>
              <p className={styles.kicker}>{t('land.propKicker')}</p>
              <h2 className={styles.featureTitle}>{t('land.propTitle')}</h2>
              <p className={styles.featureText}>{t('land.propText')}</p>
              <ButtonLink to="/signup" variant="accent">{t('land.propCta')}</ButtonLink>
            </div>
            <div className={styles.labPreview}>
              <span>{t('land.labSample')}</span>
              <strong>{t('land.labScenario')}</strong>
              <div className={styles.previewLine}><span>{t('land.labCash')}</span><b>− $186</b></div>
              <div className={styles.previewLine}><span>DSCR</span><b>0.94x</b></div>
              <div className={styles.previewLine}><span>{t('land.labNote')}</span><b>{t('land.labNoteValue')} →</b></div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>{t('land.madeFor')}</p>
            <div className={styles.audienceGrid}>
              {audiences.map(([title, text], index) => (
                <article key={title}>
                  <span className={styles.index}>0{index + 1}</span>
                  <h3 className={styles.moduleTitle}>{t(title)}</h3>
                  <p className={styles.moduleText}>{t(text)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>{t('land.approachKicker')}</p>
            <h2 className={styles.sectionTitle}>{t('land.approachTitle')}</h2>
            <div className={styles.stepsGrid}>
              {steps.map((step) => (
                <div key={step.title}>
                  <step.icon size={20} strokeWidth={1.5} />
                  <h3 className={styles.moduleTitle}>{t(step.title)}</h3>
                  <p className={styles.moduleText}>{t(step.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.ctaInner}>
            <p className={styles.kicker}>{t('land.nextKicker')}</p>
            <h2 className={styles.ctaTitle}>{t('land.ctaTitle')}</h2>
            <p className={styles.ctaText}>{t('land.ctaText')}</p>
            <ButtonLink to="/signup" variant="accent">{t('land.ctaButton')}</ButtonLink>
          </div>
        </section>
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
