import { Link } from 'react-router-dom'
import { Scale, TrendingUp, Briefcase, Gauge, Brain, House, ArrowRight } from 'lucide-react'
import { PageLayout } from '../shared/components'
import styles from './DashboardPage.module.css'

const modules = [
  {
    to: '/app/sanctions',
    icon: Scale,
    title: 'Sanctions Impact',
    text: 'GDP, trade and investment before and after sanctions.',
  },
  {
    to: '/app/inflation',
    icon: TrendingUp,
    title: 'Inflation Forecast',
    text: 'Historical inflation by country plus a simple forecast.',
  },
  {
    to: '/app/unemployment',
    icon: Briefcase,
    title: 'Unemployment Analysis',
    text: 'Unemployment dynamics with several countries on one chart.',
  },
  {
    to: '/app/quality-of-life',
    icon: Gauge,
    title: 'Quality of Life Index',
    text: 'A composite index with a ranking table and country pages.',
  },
  {
    to: '/app/ai-explainer',
    icon: Brain,
    title: 'AI Crisis Explainer',
    text: 'AI explains economic crises in plain language.',
  },
  {
    to: '/app/property-lab',
    icon: House,
    title: 'Property Lab',
    text: 'Connect rates, rents and unexpected events to a property decision.',
  },
]

export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard" subtitle="Choose a module to explore">
      <div className={styles.grid}>
        {modules.map((module) => (
          <Link key={module.to} to={module.to} className={styles.card}>
            <module.icon className={styles.icon} size={22} strokeWidth={1.5} />
            <h3 className={styles.title}>{module.title}</h3>
            <p className={styles.text}>{module.text}</p>
            <span className={styles.open}>
              Open module
              <ArrowRight size={14} strokeWidth={1.75} />
            </span>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
