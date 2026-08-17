import { Card, PageLayout } from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { getAiHistory } from '../../../backend/ai'
import { useI18n } from '../../../shared/i18n'
import styles from './AiExplainerPage.module.css'

export default function AiExplainerPage() {
  const { t } = useI18n()
  const history = useAsyncData(() => getAiHistory(), [])

  return (
    <PageLayout title={t('nav.ai')} subtitle={t('ai.subtitle')}>
      <Card title={t('ai.inactiveTitle')}>
        <p className={styles.answer}>{t('ai.inactiveBody')}</p>
        <p className={styles.empty}>{t('ai.inactiveHint')}</p>
      </Card>

      <Card title={t('ai.history')}>
        {history.loading ? (
          <p className={styles.empty}>{t('common.loading')}</p>
        ) : !history.data || history.data.length === 0 ? (
          <p className={styles.empty}>{t('ai.historyEmpty')}</p>
        ) : (
          <div className={styles.history}>
            {history.data.map((row) => (
              <details key={row.id} className={styles.historyItem}>
                <summary className={styles.historyQuestion}>{row.question}</summary>
                <p className={styles.historyAnswer}>{row.answer}</p>
              </details>
            ))}
          </div>
        )}
      </Card>
    </PageLayout>
  )
}
