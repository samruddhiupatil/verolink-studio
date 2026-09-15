/** Structurally identical to endpoint.types.ts's KeyValueRow, so both share one row editor component. */
export interface CustomHeaderRow {
  id: string
  key: string
  value: string
}

/** Ephemeral OAuth2 session state — deliberately excluded from localStorage persistence. */
export interface OAuth2Session {
  accessToken: string
  /** ISO timestamp */
  expiresAt: string
  simulated: true
}

export type AuthConfig =
  | { type: 'none' }
  | {
      type: 'apiKey'
      headerName: string
      keyValue: string
      placement: 'header' | 'query'
    }
  | {
      type: 'oauth2'
      tokenUrl: string
      clientId: string
      clientSecret: string
      scope: string
      grantType: 'client_credentials' | 'authorization_code'
      session?: OAuth2Session
    }
  | {
      type: 'basic'
      username: string
      password: string
    }
  | {
      type: 'bearer'
      token: string
    }
  | {
      type: 'customHeaders'
      headers: CustomHeaderRow[]
    }

export type AuthType = AuthConfig['type']

export function createDefaultAuthConfig(): AuthConfig {
  return { type: 'none' }
}
