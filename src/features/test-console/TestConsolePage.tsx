import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppState } from '../../app/AppStateContext'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import type { RequestHistoryEntry } from '../../domain/history.types'
import { executeRequest } from '../../lib/http/executeRequest'
import { toHistoryEntry } from '../../lib/http/toHistoryEntry'
import { EndpointSelector } from './EndpointSelector'
import { RequestHistoryList } from './RequestHistoryList'
import { RequestPane } from './RequestPane'
import { ResponsePane } from './ResponsePane'
import styles from './TestConsolePage.module.css'
import { VariableInputForm } from './VariableInputForm'

interface TestConsoleLocationState {
  focusHistoryId?: string
}

export function TestConsolePage() {
  const { state, dispatch } = useAppState()
  const location = useLocation()

  const [selectedEndpointId, setSelectedEndpointId] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [displayed, setDisplayed] = useState<RequestHistoryEntry | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const focusId = (location.state as TestConsoleLocationState | null)?.focusHistoryId
    if (!focusId) return
    const entry = state.history.find((h) => h.id === focusId)
    if (entry) setDisplayed(entry)
    // Only react to a fresh navigation carrying focusHistoryId, not every history change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const selectedEndpoint = state.endpoints.find((e) => e.id === selectedEndpointId)

  async function runRequest() {
    if (!selectedEndpoint) return
    setRunning(true)
    try {
      const result = await executeRequest({
        endpoint: selectedEndpoint,
        baseUrl: state.connector.baseUrl,
        variableValues,
        auth: state.auth,
      })
      const entry = toHistoryEntry(result, {
        endpointId: selectedEndpoint.id,
        endpointLabel: selectedEndpoint.label,
        source: 'test-console',
      })
      dispatch({ type: 'APPEND_HISTORY_ENTRY', payload: entry })
      setDisplayed(entry)

      if (!result.errorKind && result.statusCode !== null && result.statusCode >= 200 && result.statusCode < 300 && result.responseBody) {
        try {
          const raw = JSON.parse(result.responseBody)
          dispatch({
            type: 'SET_LAST_TEST_RESPONSE',
            payload: { endpointId: selectedEndpoint.id, raw, timestamp: entry.timestamp },
          })
        } catch {
          // Response wasn't JSON — nothing for Section 5 to map, leave lastTestResponse untouched.
        }
      }
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className={styles.page}>
      <Panel title="Connector Test Console" subtitle="Run live requests against the configured connector.">
        <div className={styles.controlsRow}>
          <EndpointSelector
            endpoints={state.endpoints}
            value={selectedEndpointId}
            onChange={(id) => {
              setSelectedEndpointId(id)
              setVariableValues({})
            }}
          />
          <Button variant="primary" onClick={runRequest} disabled={!selectedEndpoint || running}>
            {running ? 'Running…' : 'Run'}
          </Button>
        </div>

        {selectedEndpoint && (
          <VariableInputForm endpoint={selectedEndpoint} values={variableValues} onChange={setVariableValues} />
        )}

        <div className={styles.splitView}>
          <div>
            <span className={styles.subsectionTitle}>Request</span>
            <RequestPane entry={displayed} />
          </div>
          <div>
            <span className={styles.subsectionTitle}>Response</span>
            <ResponsePane entry={displayed} />
          </div>
        </div>
      </Panel>

      <Panel title="Request History" subtitle="Last 10 runs. Click an entry to reload it above.">
        <RequestHistoryList history={state.history} selectedId={displayed?.id} onSelect={setDisplayed} />
      </Panel>
    </div>
  )
}
