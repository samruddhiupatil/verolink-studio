import { nanoid } from 'nanoid'
import { useAppState } from '../../../app/AppStateContext'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import type { OutboundFormField } from '../../../domain/outbound.types'
import { FormFieldList } from './FormFieldList'
import { LiveFormPreview } from './LiveFormPreview'
import styles from './OutboundFormBuilderPage.module.css'

/** Section 6 Part A — the admin builds the data-capture form end users will fill in. */
export function OutboundFormBuilderPage() {
  const { state, dispatch } = useAppState()
  const fields = state.outbound.fields

  function addField() {
    const newField: OutboundFormField = {
      id: nanoid(),
      order: fields.length,
      label: '',
      fieldType: 'Text',
      required: false,
    }
    dispatch({ type: 'SET_OUTBOUND_FIELDS', payload: [...fields, newField] })
  }

  return (
    <Panel
      title="Outbound Form Builder"
      subtitle="Design the data-capture form. Drag the handle to reorder fields."
      actions={
        <Button variant="primary" onClick={addField}>
          + Add Field
        </Button>
      }
    >
      <div className={styles.layout}>
        <FormFieldList fields={fields} onChange={(next) => dispatch({ type: 'SET_OUTBOUND_FIELDS', payload: next })} />
        <div>
          <span className={styles.subsectionTitle}>Live Form Preview</span>
          <LiveFormPreview fields={fields} />
        </div>
      </div>
    </Panel>
  )
}
