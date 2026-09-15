import type { AuthConfig } from '../../domain/auth.types'
import { buildAuthInjection } from '../../lib/auth/buildAuthInjection'
import styles from './AuthenticationPage.module.css'

/** Shows exactly which HTTP headers/query params will be injected, secrets partially redacted. */
export function AuthPreviewPanel({ auth }: { auth: AuthConfig }) {
  const { redactedPreview } = buildAuthInjection(auth)

  if (redactedPreview.length === 0) {
    return <p className={styles.hint}>No headers or query params will be injected for this configuration.</p>
  }

  return (
    <ul className={styles.previewList}>
      {redactedPreview.map((row) => (
        <li key={row.label} className={styles.previewRow}>
          <span className={styles.previewLabel}>{row.label}</span>
          <code className={styles.previewValue}>{row.value}</code>
        </li>
      ))}
    </ul>
  )
}
