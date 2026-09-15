import { FormField } from '../../components/ui/FormField'
import { SecretField } from '../../components/ui/SecretField'
import type { AuthConfig } from '../../domain/auth.types'

interface BearerTokenFieldsProps {
  auth: Extract<AuthConfig, { type: 'bearer' }>
  onChange: (next: AuthConfig) => void
}

export function BearerTokenFields({ auth, onChange }: BearerTokenFieldsProps) {
  return (
    <FormField label="Token" htmlFor="bearer-token">
      <SecretField id="bearer-token" value={auth.token} onChange={(value) => onChange({ ...auth, token: value })} />
    </FormField>
  )
}
