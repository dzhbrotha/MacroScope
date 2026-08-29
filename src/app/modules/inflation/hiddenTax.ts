// Inflation translated into hours of work.
//
// A percentage is an abstraction. Nobody has ever felt twelve percent. What a
// person feels is that the same shopping costs more than their pay went up, so
// the figure is restated as the extra work a month of the same basket now
// takes, at unchanged pay.
//
// The arithmetic is exact; the assumption is not hidden. Annual inflation rates
// are chained into a price level, and the extra hours are that price rise
// applied to a full time month. If pay rose too, the real number is smaller,
// which is why the screen says so rather than leaving the reader to guess.

import type { IndicatorPoint } from '../../../backend/worldbank'

/** A forty hour week averaged over a year: 40 * 52 / 12. */
export const HOURS_PER_MONTH = 173.3

/** The same month in eight hour days, so the extra days have something to sit against. */
export const WORKING_DAYS_PER_MONTH = HOURS_PER_MONTH / 8

export interface HiddenTax {
  baseYear: number
  latestYear: number
  /** Price level at the latest year with the base year as 1. */
  factor: number
  /** How much more the same basket costs, in percent. */
  priceRise: number
  /** Extra hours a month of the same basket costs, if pay never moved. */
  extraHours: number
  /** The same figure as whole working days, at eight hours each. */
  extraDays: number
  /** Years inside the window that carried no reading. */
  gaps: number[]
}

export function yearsWithData(points: IndicatorPoint[]): number[] {
  return points.filter((point) => point.value !== null).map((point) => point.year)
}

/**
 * Chains the annual rates from the year after the base up to the latest, which
 * is what compounding means here: a rate stamped on a year describes the change
 * during that year, not the level at its start.
 */
export function computeHiddenTax(
  points: IndicatorPoint[],
  baseYear: number,
): HiddenTax | null {
  const facts = points.filter((point) => point.value !== null)
  if (facts.length === 0) return null

  const latestYear = facts[facts.length - 1].year
  if (baseYear >= latestYear) return null

  const known = new Map(facts.map((point) => [point.year, point.value as number]))
  let factor = 1
  const gaps: number[] = []
  for (let year = baseYear + 1; year <= latestYear; year += 1) {
    const rate = known.get(year)
    if (rate === undefined) {
      gaps.push(year)
      continue
    }
    factor *= 1 + rate / 100
  }

  const priceRise = (factor - 1) * 100
  const extraHours = HOURS_PER_MONTH * (factor - 1)

  return {
    baseYear,
    latestYear,
    factor,
    priceRise,
    extraHours,
    extraDays: extraHours / 8,
    gaps,
  }
}
