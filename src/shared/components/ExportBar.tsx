import { Download, Link2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n'
import styles from './ExportBar.module.css'

interface ExportBarProps {
  onCsv: () => void
  onPng?: () => void
}

export default function ExportBar({ onCsv, onPng }: ExportBarProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard can be blocked; the address bar already holds the link
    }
  }

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.action} onClick={onCsv}>
        <Download size={14} strokeWidth={1.75} />
        {t('common.exportCsv')}
      </button>
      {onPng ? (
        <button type="button" className={styles.action} onClick={onPng}>
          <Download size={14} strokeWidth={1.75} />
          {t('common.exportPng')}
        </button>
      ) : null}
      <button type="button" className={styles.action} onClick={copyLink}>
        <Link2 size={14} strokeWidth={1.75} />
        {copied ? t('common.linkCopied') : t('common.copyLink')}
      </button>
    </div>
  )
}
