import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { JsonTree } from '../../components/ui/JsonTree'
import { StatusPill } from '../../components/ui/StatusPill'
import type { RequestHistoryEntry } from '../../domain/history.types'
import styles from './TestConsolePage.module.css'

function tryParseJson(text: string | undefined): unknown | undefined {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export function ResponsePane({ entry }: { entry: RequestHistoryEntry | null }) {
  const [showRaw, setShowRaw] = useState(false)

  if (!entry) return <p className={styles.empty}>No response yet.</p>

  if (entry.errorKind) {
    const message =
      entry.errorKind === 'timeout'
        ? 'The request timed out before a response was received.'
        : 'Could not reach the target host — this may be a network error, a CORS policy block, or the host being unreachable. The browser cannot reliably distinguish these cases.'
    return (
      <div className={styles.pane}>
        <Badge tone="danger">{entry.errorKind === 'timeout' ? 'Timed out' : 'Unreachable'}</Badge>
        <p className={styles.empty}>{message}</p>
      </div>
    )
  }

  const parsed = tryParseJson(entry.responseBody)

  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <StatusPill status={entry.statusCode} />
        <span className={styles.latency}>{entry.latencyMs} ms</span>
        {parsed !== undefined && (
          <Button variant="ghost" size="sm" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? 'Show Pretty' : 'Show Raw'}
          </Button>
        )}
      </div>
      {parsed === undefined || showRaw ? (
        <pre className={styles.bodyPre}>{entry.responseBody || '(empty response body)'}</pre>
      ) : (
        <JsonTree data={parsed} />
      )}
    </div>
  )
}
