import { FormField } from '../../../components/ui/FormField'
import { Select } from '../../../components/ui/Select'
import type { EndpointDefinition } from '../../../domain/endpoint.types'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH'])

interface TargetEndpointSelectorProps {
  endpoints: EndpointDefinition[]
  value: string | undefined
  onChange: (id: string | undefined) => void
}

/** Only POST/PUT/PATCH endpoints qualify as write targets for the outbound form. */
export function TargetEndpointSelector({ endpoints, value, onChange }: TargetEndpointSelectorProps) {
  const writableEndpoints = endpoints.filter((e) => WRITE_METHODS.has(e.method))

  return (
    <FormField label="Target Write Endpoint" htmlFor="outbound-target-endpoint" hint="Only POST/PUT/PATCH endpoints are eligible">
      <Select id="outbound-target-endpoint" value={value ?? ''} onChange={(event) => onChange(event.target.value || undefined)}>
        <option value="">Select an endpoint…</option>
        {writableEndpoints.map((endpoint) => (
          <option key={endpoint.id} value={endpoint.id}>
            {endpoint.method} {endpoint.label}
          </option>
        ))}
      </Select>
    </FormField>
  )
}
