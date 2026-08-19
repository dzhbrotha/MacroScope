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
  axis: token('--color-text-muted', '#9bb0ca'),
  grid: token('--color-border', '#244363'),
  accent: token('--color-accent', '#5b8cff'),
  accentSoft: token('--color-accent-hover', '#82a8ff'),
  cyan: token('--color-cyan', '#7ed8e8'),
  surface: token('--color-surface', '#0b213e'),
  bg: token('--color-bg', '#06152a'),
  text: token('--color-text', '#f5f8ff'),
  error: token('--color-error', '#ff7180'),
} as const

// Distinguishable line colors for multi country charts, night sky family.
export const SERIES_COLORS = [
  CHART.accent,
  CHART.cyan,
  CHART.text,
  CHART.axis,
  '#3a63c9',
] as const

export const TOOLTIP_STYLE = {
  background: CHART.surface,
  border: `1px solid ${CHART.grid}`,
  borderRadius: 2,
  fontSize: 12,
  color: CHART.text,
} as const
