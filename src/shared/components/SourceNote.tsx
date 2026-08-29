import { useI18n } from '../i18n'
import styles from './SourceNote.module.css'

// Where the numbers came from, in plain sight and for free.
//
// The strongest weakness in the paid half of this category is that the source
// behind a figure sits behind the subscription: you can read the number but not
// check it. Every screen here names the dataset, the exact indicator codes and
// the day the data was pulled, so any figure can be reproduced against the
// World Bank directly.
export default function SourceNote({ codes }: { codes: string[] }) {
  const { t, lang } = useI18n()
  const date = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB')
  return (
    <p className={styles.note}>
      {t('source.line', { codes: codes.join(', '), date })}
    </p>
  )
}
