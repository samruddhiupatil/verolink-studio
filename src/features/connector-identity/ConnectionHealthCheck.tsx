import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { ConnectionHealthResult, ConnectorConfig } from '../../domain/connector.types'
import { executeRequest } from '../../lib/http/executeRequest'
import { isWellFormedUrl } from '../../lib/validation/urlValidation'
import styles from './ConnectorIdentityPage.module.css'

interface ConnectionHealthCheckProps {
  connector: ConnectorConfig
  onResult: (result: ConnectionHealthResult) => void
}

const HEALTH_CHECK_TIMEOUT_MS = 8000

export function ConnectionHealthCheck({ connector, onResult }: ConnectionHealthCheckProps) {
  const [checking, setChecking] = useState(false)
  const urlIsValid = isWellFormedUrl(connector.baseUrl)

  async function runCheck() {
    setChecking(true)
    try {
      const result = await executeRequest({
        endpoint: { method: 'GET', path: '/', headers: [], queryParams: [] },
        baseUrl: connector.baseUrl,
        variableValues: {},
        auth: { type: 'none' },
        timeoutMs: HEALTH_CHECK_TIMEOUT_MS,
      })
      onResult({
        timestamp: new Date().toISOString(),
        reachable: result.errorKind === undefined,
        latencyMs: result.errorKind === undefined ? result.latencyMs : undefined,
        errorKind: result.errorKind,
      })
    } finally {
      setChecking(false)
    }
  }

  const lastCheck = connector.lastHealthCheck

  return (
    <div className={styles.healthRow}>
      <Button variant="secondary" onClick={runCheck} disabled={!urlIsValid || checking}>
        {checking ? 'Checking…' : 'Check Connection Health'}
      </Button>
      {!urlIsValid && <span className={styles.healthTimestamp}>Enter a valid Base URL first.</span>}
      {lastCheck && (
        <div className={styles.healthResult}>
          {lastCheck.reachable ? (
            <>
              <Badge tone="success">Reachable</Badge>
              <span className={styles.healthLatency}>{lastCheck.latencyMs} ms</span>
            </>
          ) : (
            <Badge tone="danger">
              {lastCheck.errorKind === 'timeout'
                ? 'Timed out'
                : 'Unreachable — network error, CORS policy, or host unreachable'}
            </Badge>
          )}
          <span className={styles.healthTimestamp}>{new Date(lastCheck.timestamp).toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  )
}
