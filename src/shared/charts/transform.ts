// Chart range and unit transforms.
//
// Two problems kept coming up when comparing countries. A chart that starts in
// 1960 hides what happened in the last decade, and a country with a small
// economy is a flat line next to a large one. Terminals like TradingView solve
// the first with a range switch and services like FRED solve the second with a
// units switch, so the same two controls live here and every module reuses them.

import type { IndicatorPoint } from '../../backend/worldbank'

export type RangeKey = '10' | '25' | 'all'
export type UnitsKey = 'level' | 'index' | 'change'

export const RANGES: RangeKey[] = ['10', '25', 'all']
export const UNITS: UnitsKey[] = ['level', 'index', 'change']

const RANGE_YEARS: Record<RangeKey, number | null> = { '10': 10, '25': 25, all: null }

export function isRange(value: string): value is RangeKey {
  return (RANGES as string[]).includes(value)
}

export function isUnits(value: string): value is UnitsKey {
  return (UNITS as string[]).includes(value)
}

/** The most recent year that carries a value across every series on the chart. */
export function lastYearOf(series: IndicatorPoint[][]): number | null {
  let last: number | null = null
  series.forEach((points) => {
    points.forEach((point) => {
      if (point.value !== null && (last === null || point.year > last)) last = point.year
    })
  })
  return last
}

/** The first year kept by a range, so every series is clipped identically. */
export function startYearOf(series: IndicatorPoint[][], range: RangeKey): number | null {
  const span = RANGE_YEARS[range]
  if (span === null) return null
  const last = lastYearOf(series)
  return last === null ? null : last - span + 1
}

function clip(points: IndicatorPoint[], startYear: number | null): IndicatorPoint[] {
  if (startYear === null) return points
  return points.filter((point) => point.year >= startYear)
}

function toIndex(points: IndicatorPoint[]): IndicatorPoint[] {
  const base = points.find((point) => point.value !== null && point.value !== 0)
  if (!base) return points.map((point) => ({ year: point.year, value: null }))
  const divisor = base.value as number
  return points.map((point) => ({
    year: point.year,
    value: point.value === null ? null : (point.value / divisor) * 100,
  }))
}

function toChange(points: IndicatorPoint[]): IndicatorPoint[] {
  return points.map((point, index) => {
    const previous = index > 0 ? points[index - 1] : null
    if (point.value === null || previous === null || previous.value === null) {
      return { year: point.year, value: null }
    }
    return { year: point.year, value: point.value - previous.value }
  })
}

/**
 * Clip to the range first, then convert. Doing it in this order means the index
 * is rebased to the first visible year, which is what the reader expects when
 * the label says the chart starts at 100.
 */
export function applyView(
  points: IndicatorPoint[],
  startYear: number | null,
  units: UnitsKey,
): IndicatorPoint[] {
  const window = clip(points, startYear)
  if (units === 'index') return toIndex(window)
  if (units === 'change') return toChange(window)
  return window
}

export function unitFor(units: UnitsKey, baseUnit: string): string {
  if (units === 'index') return ''
  if (units === 'change') return baseUnit === '' ? '' : baseUnit
  return baseUnit
}
