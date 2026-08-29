// Audit of the composite index.
//
// Every ranking product publishes its weights. The methodology literature is
// blunt about why that is not enough: in a linearly aggregated index the
// published weight is a trade-off rate, not a measure of importance, and the
// gap between the weight a developer states and the influence the subindex
// actually has on the ordering is the norm rather than the exception. On top of
// that, roughly four out of five published composite indices carry no
// robustness check at all, so nobody knows whether the ranking survives a
// different set of choices.
//
// This file answers both objections for our own index, which is the only
// honest way to raise them about anyone else's.

import { WEIGHTS } from './index'
import type { ScoredCountry, Subscores } from './index'

export type SubKey = keyof Subscores

export const SUB_KEYS: SubKey[] = ['gdp', 'life', 'inflation', 'unemployment']

export type Weights = Record<SubKey, number>

export const BASE_WEIGHTS: Weights = { ...WEIGHTS }

export interface Scenario {
  key: string
  /** The subindex the scenario leans on, null for the two neutral runs. */
  focus: SubKey | null
  direction: 'base' | 'equal' | 'heavier' | 'lighter'
  weights: Weights
}

function rescale(weights: Weights): Weights {
  const total = SUB_KEYS.reduce((sum, key) => sum + weights[key], 0)
  return SUB_KEYS.reduce((out, key) => {
    out[key] = weights[key] / total
    return out
  }, {} as Weights)
}

export function scoreWith(subscores: Subscores, weights: Weights): number {
  return SUB_KEYS.reduce((sum, key) => sum + subscores[key] * weights[key], 0)
}

/**
 * The set of weightings the ranking is stress tested against: the published
 * one, an equal weighting, and every subindex in turn doubled and halved.
 */
export function buildScenarios(): Scenario[] {
  const list: Scenario[] = [
    { key: 'base', focus: null, direction: 'base', weights: BASE_WEIGHTS },
    {
      key: 'equal',
      focus: null,
      direction: 'equal',
      weights: rescale({ gdp: 1, life: 1, inflation: 1, unemployment: 1 }),
    },
  ]
  SUB_KEYS.forEach((key) => {
    list.push({
      key: `heavier:${key}`,
      focus: key,
      direction: 'heavier',
      weights: rescale({ ...BASE_WEIGHTS, [key]: BASE_WEIGHTS[key] * 2 }),
    })
    list.push({
      key: `lighter:${key}`,
      focus: key,
      direction: 'lighter',
      weights: rescale({ ...BASE_WEIGHTS, [key]: BASE_WEIGHTS[key] / 2 }),
    })
  })
  return list
}

export interface RankBand {
  best: number
  worst: number
  spread: number
}

/**
 * Re-ranks every country under each scenario and keeps the best and worst place
 * it reaches. Normalisation does not depend on the weights, so the subscores
 * are reused and only the weighted sum is recomputed.
 */
export function computeBands(scored: ScoredCountry[]): {
  bands: Map<string, RankBand>
  scenarioCount: number
} {
  const scenarios = buildScenarios()
  const bands = new Map<string, RankBand>()

  scenarios.forEach((scenario) => {
    const order = scored
      .map((row) => ({ code: row.code, value: scoreWith(row.subscores, scenario.weights) }))
      .sort((a, b) => b.value - a.value)

    order.forEach((entry, index) => {
      const place = index + 1
      const current = bands.get(entry.code)
      if (!current) {
        bands.set(entry.code, { best: place, worst: place, spread: 0 })
        return
      }
      current.best = Math.min(current.best, place)
      current.worst = Math.max(current.worst, place)
      current.spread = current.worst - current.best
    })
  })

  return { bands, scenarioCount: scenarios.length }
}

export interface Influence {
  key: SubKey
  /** What the methodology says the subindex is worth. */
  weight: number
  /** The share of the spread in final scores this subindex actually explains. */
  share: number
  /** share divided by weight: above one means it matters more than stated. */
  ratio: number
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Exact variance decomposition of a weighted sum. For S = sum(w_i * x_i),
 * Var(S) = sum(w_i * Cov(x_i, S)), so each subindex owns a share of the spread
 * in the final score and the shares add up to one. That share, not the weight,
 * is what decides the ordering.
 */
export function computeInfluence(scored: ScoredCountry[]): Influence[] {
  if (scored.length < 2) {
    return SUB_KEYS.map((key) => ({ key, weight: BASE_WEIGHTS[key], share: 0, ratio: 0 }))
  }

  const totals = scored.map((row) => scoreWith(row.subscores, BASE_WEIGHTS))
  const totalMean = mean(totals)
  const totalVariance = mean(totals.map((value) => (value - totalMean) ** 2))
  if (totalVariance === 0) {
    return SUB_KEYS.map((key) => ({ key, weight: BASE_WEIGHTS[key], share: 0, ratio: 0 }))
  }

  return SUB_KEYS.map((key) => {
    const column = scored.map((row) => row.subscores[key])
    const columnMean = mean(column)
    const covariance = mean(
      column.map((value, index) => (value - columnMean) * (totals[index] - totalMean)),
    )
    const share = (BASE_WEIGHTS[key] * covariance) / totalVariance
    return {
      key,
      weight: BASE_WEIGHTS[key],
      share,
      ratio: BASE_WEIGHTS[key] === 0 ? 0 : share / BASE_WEIGHTS[key],
    }
  })
}
