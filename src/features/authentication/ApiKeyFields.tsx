import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { SecretField } from '../../components/ui/SecretField'
import { Select } from '../../components/ui/Select'
import type { AuthConfig } from '../../domain/auth.types'
import styles from './AuthenticationPage.module.css'

interface ApiKeyFieldsProps {
  auth: Extract<AuthConfig, { type: 'apiKey' }>
  onChange: (next: AuthConfig) => void
}

export function ApiKeyFields({ auth, onChange }: ApiKeyFieldsProps) {
  return (
    <div className={styles.grid}>
      <FormField label="Header Name" htmlFor="apikey-header-name">
        <Input
          id="apikey-header-name"
          value={auth.headerName}
          onChange={(event) => onChange({ ...auth, headerName: event.target.value })}
          placeholder="X-Api-Key"
        />
      </FormField>
      <FormField label="Placement" htmlFor="apikey-placement">
        <Select
          id="apikey-placement"
          value={auth.placement}
          onChange={(event) => onChange({ ...auth, placement: event.target.value as 'header' | 'query' })}
        >
          <option value="header">Header</option>
          <option value="query">Query Param</option>
        </Select>
      </FormField>
      <div className={styles.gridFull}>
        <FormField label="Key Value" htmlFor="apikey-value">
          <SecretField id="apikey-value" value={auth.keyValue} onChange={(value) => onChange({ ...auth, keyValue: value })} />
        </FormField>
      </div>
    </div>
  )
}
