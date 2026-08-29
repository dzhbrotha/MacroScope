import type { Language, TranslationKey } from './dict'

// Counted nouns need different forms in the two languages: English has two,
// Russian has three and the choice depends on the last digit. Without this a
// screen prints "1 years old" and "1 лет", which reads as a bug to the reader
// even when the number is right.
export function pluralKey(
  lang: Language,
  count: number,
  one: TranslationKey,
  few: TranslationKey,
  many: TranslationKey,
): TranslationKey {
  const size = Math.abs(count)
  if (lang !== 'ru') return size === 1 ? one : many
  const tens = size % 100
  if (tens >= 11 && tens <= 14) return many
  const ones = size % 10
  if (ones === 1) return one
  if (ones >= 2 && ones <= 4) return few
  return many
}
