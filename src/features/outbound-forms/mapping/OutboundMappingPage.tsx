import { useAppState } from '../../../app/AppStateContext'
import { Panel } from '../../../components/ui/Panel'
import { FieldToPathMapper } from './FieldToPathMapper'
import styles from './OutboundMappingPage.module.css'
import { PayloadPreviewPanel } from './PayloadPreviewPanel'
import { TargetEndpointSelector } from './TargetEndpointSelector'

/** Section 6 Part B — maps the outbound form's fields onto a write endpoint's JSON body. */
export function OutboundMappingPage() {
  const { state, dispatch } = useAppState()
  const { outbound } = state

  return (
    <Panel title="Outbound Mapping Configuration" subtitle="Map each form field to a JSON path on the target write endpoint.">
      <TargetEndpointSelector
        endpoints={state.endpoints}
        value={outbound.targetEndpointId}
        onChange={(id) => dispatch({ type: 'SET_OUTBOUND_TARGET_ENDPOINT', payload: id })}
      />

      <div className={styles.layout}>
        <FieldToPathMapper
          fields={outbound.fields}
          mappings={outbound.mappings}
          onChange={(mappings) => dispatch({ type: 'SET_OUTBOUND_MAPPINGS', payload: mappings })}
        />
        <div>
          <PayloadPreviewPanel fields={outbound.fields} mappings={outbound.mappings} />
        </div>
      </div>
    </Panel>
  )
}
