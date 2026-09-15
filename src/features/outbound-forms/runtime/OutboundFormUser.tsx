import { useState } from 'react'
import { useAppState } from '../../../app/AppStateContext'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import type { RequestHistoryEntry } from '../../../domain/history.types'
import { executeRequest } from '../../../lib/http/executeRequest'
import { buildOutboundPayload } from '../../../lib/http/payloadConstruction'
import { toHistoryEntry } from '../../../lib/http/toHistoryEntry'
import { validateOutboundSubmission } from '../../../lib/validation/formValidation'
import { VariableInputForm } from '../../test-console/VariableInputForm'
import { OutboundFieldRenderer } from '../OutboundFieldRenderer'
import styles from './OutboundFormUser.module.css'
import { SubmissionResultPanel } from './SubmissionResultPanel'

function initialValues(fields: { id: string; placeholderOrDefault?: string }[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.id, field.placeholderOrDefault ?? '']))
}

/** Section 6 Part C — the clean, end-user-facing render of the form built in Part A. */
export function OutboundFormUser() {
  const { state, dispatch } = useAppState()
  const { outbound } = state
  const targetEndpoint = state.endpoints.find((e) => e.id === outbound.targetEndpointId)

  const [values, setValues] = useState<Record<string, string>>(() => initialValues(outbound.fields))
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<RequestHistoryEntry | null>(null)

  if (outbound.fields.length === 0 || !targetEndpoint) {
    return (
      <div className={styles.page}>
        <Panel title="Outbound Form">
          <p className={styles.empty}>
            This form isn&apos;t configured yet. An admin needs to add fields and a target endpoint in the Outbound
            Form Builder and Mapping sections first.
          </p>
        </Panel>
      </div>
    )
  }

  if (result) {
    return (
      <div className={styles.page}>
        <SubmissionResultPanel entry={result} onBackToForm={() => setResult(null)} />
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const errors = validateOutboundSubmission(outbound.fields, values)
    if (errors.length > 0) {
      setFieldErrors(Object.fromEntries(errors.map((e) => [e.fieldId, e.message])))
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    try {
      const payload = buildOutboundPayload(outbound.fields, outbound.mappings, values)
      const executionResult = await executeRequest({
        endpoint: targetEndpoint!,
        baseUrl: state.connector.baseUrl,
        variableValues,
        auth: state.auth,
        bodyOverride: JSON.stringify(payload),
      })
      const entry = toHistoryEntry(executionResult, {
        endpointId: targetEndpoint!.id,
        endpointLabel: targetEndpoint!.label,
        source: 'outbound-submission',
      })
      dispatch({ type: 'APPEND_HISTORY_ENTRY', payload: entry })
      setResult(entry)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <Panel title={state.connector.name || 'Submit Data'}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {[...outbound.fields]
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <OutboundFieldRenderer
                key={field.id}
                field={field}
                value={values[field.id] ?? ''}
                onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
                error={fieldErrors[field.id]}
              />
            ))}

          <VariableInputForm endpoint={targetEndpoint} values={variableValues} onChange={setVariableValues} />

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </form>
      </Panel>
    </div>
  )
}
