import { useAppState } from '../../app/AppStateContext'
import { Panel } from '../../components/ui/Panel'
import { createAuthConfigForType, type AuthType } from '../../domain/auth.types'
import { ApiKeyFields } from './ApiKeyFields'
import { AuthPreviewPanel } from './AuthPreviewPanel'
import { AuthTypeSelector } from './AuthTypeSelector'
import styles from './AuthenticationPage.module.css'
import { BasicAuthFields } from './BasicAuthFields'
import { BearerTokenFields } from './BearerTokenFields'
import { CustomHeaderRows } from './CustomHeaderRows'
import { OAuth2Fields } from './OAuth2Fields'

export function AuthenticationPage() {
  const { state, dispatch } = useAppState()
  const auth = state.auth

  function setAuthType(type: AuthType) {
    dispatch({ type: 'SET_AUTH', payload: createAuthConfigForType(type) })
  }

  function setAuth(next: typeof auth) {
    dispatch({ type: 'SET_AUTH', payload: next })
  }

  return (
    <div className={styles.page}>
      <Panel title="Authentication" subtitle="Configure how VeroLink Studio authenticates to the target system.">
        <AuthTypeSelector value={auth.type} onChange={setAuthType} />
        <div className={styles.fieldsArea}>
          {auth.type === 'none' && <p className={styles.hint}>No authentication will be applied to requests.</p>}
          {auth.type === 'apiKey' && <ApiKeyFields auth={auth} onChange={setAuth} />}
          {auth.type === 'oauth2' && <OAuth2Fields auth={auth} onChange={setAuth} />}
          {auth.type === 'basic' && <BasicAuthFields auth={auth} onChange={setAuth} />}
          {auth.type === 'bearer' && <BearerTokenFields auth={auth} onChange={setAuth} />}
          {auth.type === 'customHeaders' && <CustomHeaderRows auth={auth} onChange={setAuth} />}
        </div>
      </Panel>

      <Panel title="Auth Preview" subtitle="Exactly what will be injected into outgoing requests.">
        <AuthPreviewPanel auth={auth} />
      </Panel>
    </div>
  )
}
