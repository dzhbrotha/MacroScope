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
  axis: token('--color-text-muted', '#c0949d'),
  grid: token('--color-border', '#4a1c28'),
  accent: token('--color-accent', '#e8425c'),
  accentSoft: token('--color-accent-hover', '#f45c74'),
  cyan: token('--color-cyan', '#e8a33d'),
  surface: token('--color-surface', '#210b11'),
  bg: token('--color-bg', '#150609'),
  text: token('--color-text', '#fdf0f2'),
  positive: token('--color-positive', '#4fd18b'),
  error: token('--color-error', '#ff7a3d'),
} as const

// Distinguishable line colors for multi country charts, cherry family.
export const SERIES_COLORS = [
  CHART.accent,
  CHART.cyan,
  CHART.text,
  CHART.axis,
  CHART.positive,
] as const

export const TOOLTIP_STYLE = {
  background: CHART.surface,
  border: `1px solid ${CHART.grid}`,
  borderRadius: 2,
  fontSize: 12,
  color: CHART.text,
} as const
