import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import type { RequestHistoryEntry } from '../../../domain/history.types'
import styles from './OutboundFormUser.module.css'

interface SubmissionResultPanelProps {
  entry: RequestHistoryEntry
  onBackToForm: () => void
}

function prettify(text: string | undefined): string {
  if (!text) return '(empty response body)'
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

/** Success / 4xx-5xx failure / network failure — the three outcomes spec'd for Section 6 Part C. */
export function SubmissionResultPanel({ entry, onBackToForm }: SubmissionResultPanelProps) {
  if (entry.errorKind) {
    const message =
      entry.errorKind === 'timeout'
        ? 'The request timed out before a response was received.'
        : 'Could not reach the target host — this may be a network error, a CORS policy block, or the host being unreachable. The browser cannot reliably distinguish these cases.'
    return (
      <Panel title="Submission Failed">
        <Badge tone="danger">{entry.errorKind === 'timeout' ? 'Timed Out' : 'Unreachable'}</Badge>
        <p className={styles.resultMessage}>{message}</p>
        <div className={styles.resultActions}>
          <Button variant="primary" onClick={onBackToForm}>
            Edit & Retry
          </Button>
        </div>
      </Panel>
    )
  }

  const isSuccess = entry.statusCode !== null && entry.statusCode >= 200 && entry.statusCode < 300

  if (isSuccess) {
    return (
      <Panel title="Submission Successful">
        <Badge tone="success">Success — {entry.statusCode}</Badge>
        <p className={styles.resultMessage}>Your submission was received.</p>
        <pre className={styles.resultBody}>{prettify(entry.responseBody)}</pre>
        <div className={styles.resultActions}>
          <Link to="/test-console" state={{ focusHistoryId: entry.id }}>
            View in Request History
          </Link>
          <Button variant="secondary" onClick={onBackToForm}>
            Submit Another
          </Button>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title="Submission Failed">
      <Badge tone="danger">{entry.statusCode}</Badge>
      <pre className={styles.resultBody}>{prettify(entry.responseBody)}</pre>
      <div className={styles.resultActions}>
        <Button variant="primary" onClick={onBackToForm}>
          Edit & Retry
        </Button>
      </div>
    </Panel>
  )
}
