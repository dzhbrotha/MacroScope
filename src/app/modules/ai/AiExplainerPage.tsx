import { Card, PageLayout } from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { getAiHistory } from '../../../backend/ai'
import styles from './AiExplainerPage.module.css'

export default function AiExplainerPage() {
  const history = useAsyncData(() => getAiHistory(), [])

  return (
    <PageLayout
      title="AI Crisis Explainer"
      subtitle="Pick a crisis or ask your own question, AI answers in plain language"
    >
      <Card title="AI module — inactive">
        <p className={styles.answer}>The AI Crisis Explainer is present in the product but inactive until the secure Anthropic integration is configured. No API key is required for MacroScope to work.</p>
        <p className={styles.empty}>When enabled, this module will explain causes, mechanics, and consequences in plain language.</p>
      </Card>

      <Card title="Your recent questions">
        {history.loading ? (
          <p className={styles.empty}>Loading history</p>
        ) : !history.data || history.data.length === 0 ? (
          <p className={styles.empty}>No questions yet. Ask something above.</p>
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
