import ButtonLink from './ButtonLink'
import { useI18n } from '../i18n'
import styles from './NotFound.module.css'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <main className={styles.page}>
      <span className={styles.code}>404</span>
      <p className={styles.text}>{t('notFound.text')}</p>
      <ButtonLink to="/" variant="secondary">
        {t('notFound.back')}
      </ButtonLink>
    </main>
  )
}
