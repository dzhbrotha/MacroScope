// The single chart palette for the whole project.
//
// Recharts needs concrete values for SVG attributes, so the palette is resolved
// from the design tokens once at load time instead of being copied by hand.
// The literals below are only the fallback for a non browser environment; when
// tokens.css changes, the charts follow automatically.

function token(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export const CHART = {
  axis: token('--color-text-muted', '#a0a0a3'),
  grid: token('--color-border', '#3c3c3e'),
  accent: token('--color-accent', '#d5575e'),
  accentSoft: token('--color-accent-soft', '#e6a8a8'),
  accentFill: token('--color-accent-fill', '#b62a2d'),
  surface: token('--color-surface', '#29292a'),
  bg: token('--color-bg', '#222223'),
  text: token('--color-text', '#fefefe'),
  positive: token('--color-positive', '#e6a8a8'),
  error: token('--color-error', '#d5575e'),
} as const

// Distinguishable line colors for multi country charts, red family.
export const SERIES_COLORS = [
  CHART.accent,
  CHART.accentSoft,
  CHART.text,
  CHART.axis,
  CHART.accentFill,
] as const

export const TOOLTIP_STYLE = {
  background: CHART.surface,
  border: `1px solid ${CHART.grid}`,
  borderRadius: 2,
  fontSize: 12,
  color: CHART.text,
} as const
