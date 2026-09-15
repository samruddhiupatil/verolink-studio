import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { KeyValueRowsEditor } from '../../components/ui/KeyValueRowsEditor'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { HTTP_METHODS, type EndpointDefinition, type HttpMethod } from '../../domain/endpoint.types'
import { validateJsonText } from '../../lib/validation/jsonValidation'
import styles from './EndpointFormPanel.module.css'
import { RequestBodyEditor } from './RequestBodyEditor'
import { ResponseSchemaMapper } from './ResponseSchemaMapper'

interface EndpointFormPanelProps {
  initialEndpoint: EndpointDefinition
  isNew: boolean
  onSave: (endpoint: EndpointDefinition) => void
  onCancel: () => void
}

export function EndpointFormPanel({ initialEndpoint, isNew, onSave, onCancel }: EndpointFormPanelProps) {
  const [draft, setDraft] = useState<EndpointDefinition>(initialEndpoint)
  const [attemptedSave, setAttemptedSave] = useState(false)

  const labelError = attemptedSave && !draft.label.trim() ? 'Label is required.' : undefined
  const pathError = attemptedSave && !draft.path.trim() ? 'Path is required.' : undefined
  const bodyValidation = validateJsonText(draft.requestBody ?? '')
  const canSave = draft.label.trim().length > 0 && draft.path.trim().length > 0 && bodyValidation.valid

  function patch(fields: Partial<EndpointDefinition>) {
    setDraft((prev) => ({ ...prev, ...fields }))
  }

  function handleSave() {
    setAttemptedSave(true)
    if (!canSave) return
    onSave({ ...draft, updatedAt: new Date().toISOString() })
  }

  return (
    <div className={styles.form}>
      <div className={styles.grid}>
        <FormField label="Label" htmlFor="endpoint-label" required error={labelError}>
          <Input
            id="endpoint-label"
            value={draft.label}
            onChange={(event) => patch({ label: event.target.value })}
            placeholder="e.g. Get Vendor List"
            hasError={Boolean(labelError)}
          />
        </FormField>
        <FormField label="Method" htmlFor="endpoint-method">
          <Select id="endpoint-method" value={draft.method} onChange={(event) => patch({ method: event.target.value as HttpMethod })}>
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
        </FormField>
        <div className={styles.gridFull}>
          <FormField label="Path" htmlFor="endpoint-path" required error={pathError} hint="Supports {{variable}} placeholders, e.g. /vendors/{{vendor_id}}">
            <Input
              id="endpoint-path"
              value={draft.path}
              onChange={(event) => patch({ path: event.target.value })}
              placeholder="/vendors/{{vendor_id}}"
              hasError={Boolean(pathError)}
              mono
            />
          </FormField>
        </div>
        <div className={styles.gridFull}>
          <FormField label="Description" htmlFor="endpoint-description" hint="Optional">
            <Textarea
              id="endpoint-description"
              value={draft.description ?? ''}
              onChange={(event) => patch({ description: event.target.value })}
              rows={2}
            />
          </FormField>
        </div>
      </div>

      <div className={styles.subsection}>
        <span className={styles.subsectionTitle}>Headers</span>
        <KeyValueRowsEditor
          rows={draft.headers}
          onChange={(headers) => patch({ headers })}
          keyPlaceholder="Header name"
          valuePlaceholder="Header value"
          addLabel="Add header"
          emptyMessage="No headers configured."
        />
      </div>

      <div className={styles.subsection}>
        <span className={styles.subsectionTitle}>Query Params</span>
        <KeyValueRowsEditor
          rows={draft.queryParams}
          onChange={(queryParams) => patch({ queryParams })}
          keyPlaceholder="Param name"
          valuePlaceholder="Param value"
          addLabel="Add query param"
          emptyMessage="No query params configured."
        />
      </div>

      <RequestBodyEditor method={draft.method} value={draft.requestBody ?? ''} onChange={(requestBody) => patch({ requestBody })} />

      <div className={styles.subsection}>
        <span className={styles.subsectionTitle}>Response Schema</span>
        <ResponseSchemaMapper fields={draft.responseSchema} onChange={(responseSchema) => patch({ responseSchema })} />
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleSave}>
          {isNew ? 'Add Endpoint' : 'Save Changes'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
