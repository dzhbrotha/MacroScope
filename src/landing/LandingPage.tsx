import { Link } from 'react-router-dom'
import { Scale, TrendingUp, Briefcase, Gauge, Brain, Database, Zap, Lock } from 'lucide-react'
import { ButtonLink } from '../shared/components'
import { Logo } from '../shared/components'
import buttonStyles from '../shared/components/Button.module.css'
import styles from './LandingPage.module.css'

const modules = [
  {
    icon: Scale,
    title: 'Sanctions Impact',
    text: 'GDP, trade and investment before and after sanctions, with a timeline of key packages.',
  },
  {
    icon: TrendingUp,
    title: 'Inflation Forecast',
    text: 'Historical inflation by country plus a simple forecast with a clear boundary between fact and projection.',
  },
  {
    icon: Briefcase,
    title: 'Unemployment Analysis',
    text: 'Unemployment dynamics by country and year, with several countries compared on one chart.',
  },
  {
    icon: Gauge,
    title: 'Quality of Life Index',
    text: 'A composite index built from open indicators, with a ranking table and a page for every country.',
  },
  {
    icon: Brain,
    title: 'AI Crisis Explainer',
    text: 'Pick a crisis or ask a question. AI explains causes, mechanics and consequences in plain language.',
  },
]

const steps = [
  {
    icon: Database,
    title: 'Open data',
    text: 'Every indicator comes from the World Bank API, free and public.',
  },
  {
    icon: Zap,
    title: 'Fast by design',
    text: 'Responses are cached in Supabase so pages load instantly.',
  },
  {
    icon: Lock,
    title: 'Secure AI',
    text: 'The AI module runs through a server function. Keys never reach your browser.',
  },
]

const audiences = [
  ['New investors', 'Build confidence before putting real money at risk.'],
  ['Economy watchers', 'Understand how inflation, jobs, rates, and crises move markets.'],
  ['Careful decision-makers', 'Test assumptions instead of relying on hype or guesswork.'],
]

export default function LandingPage() {
  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo />
          <nav className={styles.nav}>
            <a href="#why" className={styles.navLink}>Why MacroScope</a>
            <a href="#explore" className={styles.navLink}>Explore</a>
            <a href="#property" className={styles.navLink}>Property Lab</a>
            <Link to="/signin" className={styles.navLink}>
              Sign in
            </Link>
            <ButtonLink to="/signup" variant="accent">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        <section className={`${styles.hero} ${styles.stars}`}>
          <div className={styles.heroTop}><p className={styles.kicker}>MacroScope / economic intelligence for real decisions</p><span className={styles.status}><i /> Live learning environment</span></div>
          <h1 className={styles.heroTitle}>Make sense of the forces behind your next decision.</h1>
          <p className={styles.heroText}>
            MacroScope is a learning platform that turns complicated economic conditions into
            clear, practical insight. Explore the forces shaping property investing, then test
            what they could mean for a real decision.
          </p>
          <div className={styles.heroActions}>
            <ButtonLink to="/signup" variant="accent">
              Enter the lab
            </ButtonLink>
            <a
              href="#modules"
              className={`${buttonStyles.button} ${buttonStyles.link} ${buttonStyles.secondary}`}
            >
              See what we offer
            </a>
          </div>
          <div className={styles.signalRail}><div><span>01 / Understand</span><strong>Inflation, rates, jobs</strong></div><div><span>02 / Explore</span><strong>Property decisions</strong></div><div><span>03 / Test</span><strong>Scenarios, not guesses</strong></div></div>
        </section>

        <section className={styles.storySection} id="why">
          <div className={styles.storyVisual}><div className={styles.visualWindow}><div className={styles.visualTop}><span>MACROSCOPE / FIELD NOTE</span><span>01—03</span></div><div className={styles.visualTitle}>The economy is not background noise.</div><div className={styles.visualChart}><i /><i /><i /><i /><i /><b /></div><div className={styles.visualReadout}><span>Signal / property decision</span><strong>Conditions change. Your assumptions should too.</strong></div></div></div>
          <div className={styles.storyCopy}>
            <article><span className={styles.storyNumber}>01</span><p className={styles.kicker}>The problem</p><h2>Big economic headlines are easy to see. Their consequences are not.</h2><p>Rates, inflation, employment, and crises all shape the decisions people make. But the connection between a headline and a property deal is often hidden behind jargon and scattered spreadsheets.</p></article>
            <article><span className={styles.storyNumber}>02</span><p className={styles.kicker}>The MacroScope answer</p><h2>We make the relationship visible.</h2><p>MacroScope brings reliable indicators, plain-language explanations, and transparent what-if tools into one calm workspace. You can follow a signal, understand the mechanism, and test an assumption.</p></article>
            <article><span className={styles.storyNumber}>03</span><p className={styles.kicker}>The result</p><h2>More context. Better questions. Safer learning.</h2><p>Use the platform to build intuition before making a real decision. The goal is not to predict the future—it is to help you see what could change, what matters, and what to test next.</p><ButtonLink to="/signup" variant="accent">Explore the workspace</ButtonLink></article>
          </div>
        </section>

        <section className={styles.widgetSection} id="explore">
          <div className={styles.widgetHeader}><div><p className={styles.kicker}>Inside the workspace</p><h2 className={styles.sectionTitle}>A dashboard for better questions.</h2></div><span className={styles.widgetStamp}>Educational preview / 2026</span></div>
          <div className={styles.widgetGrid}>
            <article className={`${styles.widget} ${styles.widgetWide}`}><div className={styles.widgetTop}><span>Macro pulse</span><span className={styles.widgetTag}>Sample indicators</span></div><div className={styles.signalRows}><div><span>Inflation</span><strong>3.2%</strong><em className={styles.down}>− 0.4%</em></div><div><span>Unemployment</span><strong>4.1%</strong><em>+ 0.2%</em></div><div><span>Policy rate</span><strong>5.25%</strong><em>Watching</em></div></div><p className={styles.widgetNote}>See how changing conditions affect confidence, borrowing costs, and property cash flow.</p></article>
            <article className={styles.widget}><div className={styles.widgetTop}><span>Property Lab</span><span className={styles.widgetIcon}>↗</span></div><strong className={styles.widgetNumber}>$186</strong><span className={styles.widgetLabel}>monthly cash flow in a rate-shock scenario</span><div className={styles.miniBar}><i /></div><a href="/signup">Open the calculator →</a></article>
            <article className={styles.widget}><div className={styles.widgetTop}><span>Learning path</span><span className={styles.widgetTag}>10 lessons</span></div><strong className={styles.widgetNumber}>03 / 10</strong><span className={styles.widgetLabel}>concepts to make the numbers feel familiar</span><div className={styles.lessonList}><span>NOI</span><span>Cap rate</span><span>DSCR</span></div><a href="/signup">Start learning →</a></article>
            <article className={`${styles.widget} ${styles.widgetDark}`}><div className={styles.widgetTop}><span>Next question</span><span>MacroScope</span></div><p>“What if the rent falls, rates rise, and the roof needs replacing?”</p><a href="/signup">Build a scenario →</a></article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.statement}>
            <div><p className={styles.kicker}>Who we are</p><h2 className={styles.sectionTitle}>A calmer way to learn what moves markets.</h2></div>
            <p>We are building MacroScope for people who want to understand before they act. Our product connects trusted macroeconomic data, transparent calculations, and beginner-friendly explanations in one focused workspace.</p>
          </div>
        </section>

        <section className={styles.section} id="modules">
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>What we offer</p>
            <h2 className={styles.sectionTitle}>Tools that connect the headline to the decision.</h2>
            <div className={styles.modulesGrid}>
              {modules.map((module) => (
                <article key={module.title} className={styles.moduleCard}>
                  <module.icon className={styles.moduleIcon} size={22} strokeWidth={1.5} />
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleText}>{module.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.featureSection}`} id="property">
          <div className={styles.feature}><div><p className={styles.kicker}>Start here / Property Lab</p><h2 className={styles.featureTitle}>What happens to a property deal when the world changes?</h2><p className={styles.featureText}>Adjust rent, vacancy, interest rates, repairs, and reserves. See the result instantly, with every assumption visible.</p><ButtonLink to="/signup" variant="accent">Try the Property Lab</ButtonLink></div><div className={styles.labPreview}><span>Sample scenario</span><strong>Higher interest rates</strong><div className={styles.previewLine}><span>Monthly cash flow</span><b>− $186</b></div><div className={styles.previewLine}><span>DSCR</span><b>0.94x</b></div><div className={styles.previewLine}><span>Learning note</span><b>Test a safer case →</b></div></div></div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>Made for</p>
            <div className={styles.audienceGrid}>{audiences.map(([title, text], index) => <article key={title}><span className={styles.index}>0{index + 1}</span><h3 className={styles.moduleTitle}>{title}</h3><p className={styles.moduleText}>{text}</p></article>)}</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <p className={styles.kicker}>Our approach</p>
            <h2 className={styles.sectionTitle}>Observe. Distil. Test. Decide.</h2>
            <div className={styles.stepsGrid}>
              {steps.map((step) => (
                <div key={step.title}>
                  <step.icon size={20} strokeWidth={1.5} />
                  <h3 className={styles.moduleTitle}>{step.title}</h3>
                  <p className={styles.moduleText}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.ctaInner}>
            <p className={styles.kicker}>Your next step</p>
            <h2 className={styles.ctaTitle}>Start with a clearer picture.</h2>
            <p className={styles.ctaText}>Create a free account and explore the data, scenarios, and explanations behind the market.</p>
            <ButtonLink to="/signup" variant="accent">
              Create free account
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Logo />
          <span>Built on open World Bank data</span>
        </div>
      </footer>
    </div>
  )
}
