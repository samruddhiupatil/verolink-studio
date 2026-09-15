import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import type { EndpointDefinition } from '../../domain/endpoint.types'
import styles from './TestConsolePage.module.css'

interface EndpointSelectorProps {
  endpoints: EndpointDefinition[]
  value: string
  onChange: (id: string) => void
}

export function EndpointSelector({ endpoints, value, onChange }: EndpointSelectorProps) {
  return (
    <div className={styles.endpointField}>
      <FormField label="Endpoint" htmlFor="test-console-endpoint">
        <Select id="test-console-endpoint" value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select an endpoint…</option>
          {endpoints.map((endpoint) => (
            <option key={endpoint.id} value={endpoint.id}>
              {endpoint.method} {endpoint.label}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  )
}
