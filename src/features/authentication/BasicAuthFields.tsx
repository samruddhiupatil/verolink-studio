import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { SecretField } from '../../components/ui/SecretField'
import type { AuthConfig } from '../../domain/auth.types'
import styles from './AuthenticationPage.module.css'

interface BasicAuthFieldsProps {
  auth: Extract<AuthConfig, { type: 'basic' }>
  onChange: (next: AuthConfig) => void
}

export function BasicAuthFields({ auth, onChange }: BasicAuthFieldsProps) {
  return (
    <div className={styles.grid}>
      <FormField label="Username" htmlFor="basic-username">
        <Input id="basic-username" value={auth.username} onChange={(event) => onChange({ ...auth, username: event.target.value })} />
      </FormField>
      <FormField label="Password" htmlFor="basic-password">
        <SecretField id="basic-password" value={auth.password} onChange={(value) => onChange({ ...auth, password: value })} />
      </FormField>
    </div>
  )
}
