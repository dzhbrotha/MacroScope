import {
  Brain,
  Briefcase,
  Gauge,
  Globe,
  House,
  LayoutDashboard,
  LayoutGrid,
  Scale,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TranslationKey } from '../shared/i18n'

export interface NavItem {
  to: string
  icon: LucideIcon
  label: TranslationKey
  end: boolean
}

// One list, used by the sidebar and by the command palette, so a new module
// shows up in both places at once.
export const navItems: NavItem[] = [
  { to: '/app', icon: LayoutDashboard, label: 'nav.dashboard', end: true },
  { to: '/app/board', icon: LayoutGrid, label: 'nav.board', end: false },
  { to: '/app/sanctions', icon: Scale, label: 'nav.sanctions', end: false },
  { to: '/app/inflation', icon: TrendingUp, label: 'nav.inflation', end: false },
  { to: '/app/unemployment', icon: Briefcase, label: 'nav.unemployment', end: false },
  { to: '/app/quality-of-life', icon: Gauge, label: 'nav.quality', end: false },
  { to: '/app/country', icon: Globe, label: 'nav.country', end: false },
  { to: '/app/ai-explainer', icon: Brain, label: 'nav.ai', end: false },
  { to: '/app/property-lab', icon: House, label: 'nav.property', end: false },
]
