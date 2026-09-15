import { nanoid } from 'nanoid'
import { Link } from 'react-router-dom'
import { useAppState } from '../../app/AppStateContext'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { CANONICAL_FIELDS } from '../../domain/canonicalSchema'
import type { FieldMapping } from '../../domain/mapping.types'
import { buildMappingExport, downloadJson } from '../../lib/export/exportMapping'
import { FieldMappingRow } from './FieldMappingRow'
import styles from './FieldMappingPage.module.css'
import { flattenJson } from './flattenJson'

export function FieldMappingPage() {
  const { state, dispatch } = useAppState()
  const lastTestResponse = state.lastTestResponse

  if (!lastTestResponse) {
    return (
      <div className={styles.page}>
        <Panel title="Field Mapping & Transform Preview">
          <p className={styles.empty}>
            Run a test in the <Link to="/test-console">Test Console</Link> first — field mapping works from its most
            recent successful JSON response.
          </p>
        </Panel>
      </div>
    )
  }

  const sourceFields = flattenJson(lastTestResponse.raw)

  function addMapping() {
    const newMapping: FieldMapping = {
      id: nanoid(),
      sourceJsonPath: sourceFields[0]?.path ?? '$',
      canonicalField: CANONICAL_FIELDS[0],
      transform: { type: 'none' },
    }
    dispatch({ type: 'SET_FIELD_MAPPINGS', payload: [...state.fieldMappings, newMapping] })
  }

  function updateMapping(next: FieldMapping) {
    dispatch({
      type: 'SET_FIELD_MAPPINGS',
      payload: state.fieldMappings.map((m) => (m.id === next.id ? next : m)),
    })
  }

  function removeMapping(id: string) {
    dispatch({ type: 'SET_FIELD_MAPPINGS', payload: state.fieldMappings.filter((m) => m.id !== id) })
  }

  function exportMapping() {
    downloadJson('connector-mapping.json', buildMappingExport(state.connector, state.fieldMappings))
  }

  return (
    <div className={styles.page}>
      <Panel
        title="Field Mapping & Transform Preview"
        subtitle="Map fields from the last test response onto VeroTX's canonical schema."
        actions={
          <Button variant="secondary" onClick={exportMapping} disabled={state.fieldMappings.length === 0}>
            Export connector-mapping.json
          </Button>
        }
      >
        {sourceFields.length === 0 ? (
          <p className={styles.empty}>The last test response had no fields to map.</p>
        ) : (
          <div className={styles.mappingList}>
            {state.fieldMappings.length === 0 && <p className={styles.empty}>No mappings yet.</p>}
            {state.fieldMappings.map((mapping) => (
              <FieldMappingRow
                key={mapping.id}
                mapping={mapping}
                sourceFields={sourceFields}
                onChange={updateMapping}
                onRemove={() => removeMapping(mapping.id)}
              />
            ))}
            <Button variant="secondary" size="sm" onClick={addMapping}>
              + Add Mapping
            </Button>
          </div>
        )}
      </Panel>
    </div>
  )
}
