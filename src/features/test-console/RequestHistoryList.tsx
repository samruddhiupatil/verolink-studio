import { StatusPill } from '../../components/ui/StatusPill'
import type { RequestHistoryEntry } from '../../domain/history.types'
import { classNames } from '../../components/ui/classNames'
import styles from './TestConsolePage.module.css'

interface RequestHistoryListProps {
  history: RequestHistoryEntry[]
  selectedId?: string
  onSelect: (entry: RequestHistoryEntry) => void
}

/** Last 10 runs; each entry is clickable to reload the full request/response pair into the console. */
export function RequestHistoryList({ history, selectedId, onSelect }: RequestHistoryListProps) {
  if (history.length === 0) return <p className={styles.empty}>No requests run yet.</p>

  return (
    <ul className={styles.historyList}>
      {history.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            className={classNames(styles.historyRow, entry.id === selectedId && styles.historyRowActive)}
            onClick={() => onSelect(entry)}
          >
            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
            <span>{entry.endpointLabel}</span>
            <StatusPill status={entry.statusCode} />
            <span>{entry.latencyMs} ms</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
