import { Link } from 'react-router-dom'
import { Scale, TrendingUp, Briefcase, Gauge, Brain, House, Globe, ArrowRight } from 'lucide-react'
import { PageLayout } from '../shared/components'
import { useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import styles from './DashboardPage.module.css'

const modules: { to: string; icon: typeof Scale; title: TranslationKey; text: TranslationKey }[] = [
  { to: '/app/sanctions', icon: Scale, title: 'nav.sanctions', text: 'dash.sanctions' },
  { to: '/app/inflation', icon: TrendingUp, title: 'nav.inflation', text: 'dash.inflation' },
  { to: '/app/unemployment', icon: Briefcase, title: 'nav.unemployment', text: 'dash.unemployment' },
  { to: '/app/quality-of-life', icon: Gauge, title: 'nav.quality', text: 'dash.quality' },
  { to: '/app/country', icon: Globe, title: 'nav.country', text: 'dash.country' },
  { to: '/app/ai-explainer', icon: Brain, title: 'nav.ai', text: 'dash.ai' },
  { to: '/app/property-lab', icon: House, title: 'nav.property', text: 'dash.property' },
]

export default function DashboardPage() {
  const { t } = useI18n()
  return (
    <PageLayout title={t('dash.title')} subtitle={t('dash.subtitle')}>
      <div className={styles.grid}>
        {modules.map((module) => (
          <Link key={module.to} to={module.to} className={styles.card}>
            <module.icon className={styles.icon} size={22} strokeWidth={1.5} />
            <h3 className={styles.title}>{t(module.title)}</h3>
            <p className={styles.text}>{t(module.text)}</p>
            <span className={styles.open}>
              {t('dash.open')}
              <ArrowRight size={14} strokeWidth={1.75} />
            </span>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
