import { useAppState } from '../../app/AppStateContext'
import { Panel } from '../../components/ui/Panel'
import { ConnectionHealthCheck } from './ConnectionHealthCheck'
import { ConnectorForm } from './ConnectorForm'
import styles from './ConnectorIdentityPage.module.css'

export function ConnectorIdentityPage() {
  const { state, dispatch } = useAppState()

  return (
    <div className={styles.page}>
      <Panel title="Connector Identity & Configuration" subtitle="Defines the connector every other section builds on.">
        <ConnectorForm
          connector={state.connector}
          onChange={(patch) => dispatch({ type: 'UPDATE_CONNECTOR', payload: patch })}
        />
      </Panel>

      <Panel title="Connection Health" subtitle="Ping the base URL on demand to check reachability and latency.">
        <ConnectionHealthCheck
          connector={state.connector}
          onResult={(result) => dispatch({ type: 'SET_CONNECTION_HEALTH', payload: result })}
        />
      </Panel>
    </div>
  )
}
