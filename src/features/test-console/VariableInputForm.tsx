import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import type { EndpointDefinition } from '../../domain/endpoint.types'
import { extractEndpointVariableNames } from '../../lib/interpolation/interpolateVariables'
import styles from './TestConsolePage.module.css'

interface VariableInputFormProps {
  endpoint: EndpointDefinition
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
}

/** Dynamically detects {{variable}} placeholders in the endpoint and renders one input per variable. */
export function VariableInputForm({ endpoint, values, onChange }: VariableInputFormProps) {
  const variableNames = extractEndpointVariableNames(endpoint)
  if (variableNames.length === 0) return null

  return (
    <div className={styles.variableGrid}>
      {variableNames.map((name) => (
        <div key={name} className={styles.variableField}>
          <FormField label={name} htmlFor={`test-console-var-${name}`}>
            <Input
              id={`test-console-var-${name}`}
              value={values[name] ?? ''}
              onChange={(event) => onChange({ ...values, [name]: event.target.value })}
              mono
            />
          </FormField>
        </div>
      ))}
    </div>
  )
}
