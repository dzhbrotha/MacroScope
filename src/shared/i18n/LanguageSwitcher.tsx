import { useI18n } from './I18nProvider'
import type { Language } from './dict'
import styles from './LanguageSwitcher.module.css'

const OPTIONS: Language[] = ['ru', 'en']

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className={styles.group} role="group" aria-label={t('lang.switch')}>
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={option === lang ? `${styles.option} ${styles.active}` : styles.option}
          aria-pressed={option === lang}
          onClick={() => setLang(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
