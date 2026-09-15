import { Badge } from '../../components/ui/Badge'
import type { RequestHistoryEntry } from '../../domain/history.types'
import styles from './TestConsolePage.module.css'

export function RequestPane({ entry }: { entry: RequestHistoryEntry | null }) {
  if (!entry) return <p className={styles.empty}>Run a request to see its details here.</p>

  const headerEntries = Object.entries(entry.requestHeaders)

  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <Badge tone="accent">{entry.method}</Badge>
        <code className={styles.url}>{entry.resolvedUrl}</code>
      </div>

      <div className={styles.subsection}>
        <span className={styles.subsectionTitle}>Headers</span>
        {headerEntries.length === 0 ? (
          <p className={styles.empty}>None</p>
        ) : (
          <ul className={styles.headerList}>
            {headerEntries.map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        )}
      </div>

      {entry.requestBody && (
        <div className={styles.subsection}>
          <span className={styles.subsectionTitle}>Body</span>
          <pre className={styles.bodyPre}>{entry.requestBody}</pre>
        </div>
      )}
    </div>
  )
}
