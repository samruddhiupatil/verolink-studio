import { nanoid } from 'nanoid'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { SecretField } from '../../components/ui/SecretField'
import { Select } from '../../components/ui/Select'
import type { AuthConfig } from '../../domain/auth.types'
import styles from './AuthenticationPage.module.css'
import { TokenCountdown } from './TokenCountdown'

interface OAuth2FieldsProps {
  auth: Extract<AuthConfig, { type: 'oauth2' }>
  onChange: (next: AuthConfig) => void
}

const SIMULATED_TOKEN_TTL_MS = 5 * 60 * 1000

export function OAuth2Fields({ auth, onChange }: OAuth2FieldsProps) {
  function fetchSimulatedToken() {
    const issuedAt = Date.now()
    onChange({
      ...auth,
      session: {
        accessToken: `simulated_${nanoid(24)}`,
        expiresAt: new Date(issuedAt + SIMULATED_TOKEN_TTL_MS).toISOString(),
        simulated: true,
      },
    })
  }

  function clearToken() {
    onChange({ ...auth, session: undefined })
  }

  return (
    <div className={styles.grid}>
      <FormField label="Token URL" htmlFor="oauth-token-url">
        <Input
          id="oauth-token-url"
          value={auth.tokenUrl}
          onChange={(event) => onChange({ ...auth, tokenUrl: event.target.value })}
          placeholder="https://auth.example.com/oauth/token"
          mono
        />
      </FormField>
      <FormField label="Grant Type" htmlFor="oauth-grant-type">
        <Select
          id="oauth-grant-type"
          value={auth.grantType}
          onChange={(event) =>
            onChange({ ...auth, grantType: event.target.value as 'client_credentials' | 'authorization_code' })
          }
        >
          <option value="client_credentials">Client Credentials</option>
          <option value="authorization_code">Authorization Code</option>
        </Select>
      </FormField>
      <FormField label="Client ID" htmlFor="oauth-client-id">
        <Input id="oauth-client-id" value={auth.clientId} onChange={(event) => onChange({ ...auth, clientId: event.target.value })} />
      </FormField>
      <FormField label="Client Secret" htmlFor="oauth-client-secret">
        <SecretField id="oauth-client-secret" value={auth.clientSecret} onChange={(value) => onChange({ ...auth, clientSecret: value })} />
      </FormField>
      <div className={styles.gridFull}>
        <FormField label="Scope" htmlFor="oauth-scope" hint="Space-separated scopes">
          <Input id="oauth-scope" value={auth.scope} onChange={(event) => onChange({ ...auth, scope: event.target.value })} />
        </FormField>
      </div>
      <div className={styles.gridFull}>
        <TokenCountdown session={auth.session} onFetchToken={fetchSimulatedToken} onClearToken={clearToken} />
      </div>
    </div>
  )
}
