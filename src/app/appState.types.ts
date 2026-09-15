import type { AuthConfig } from '../domain/auth.types'
import type { ConnectorConfig } from '../domain/connector.types'
import type { EndpointDefinition } from '../domain/endpoint.types'
import type { FieldMapping } from '../domain/mapping.types'
import type { RequestHistoryEntry } from '../domain/history.types'
import type { OutboundConfig } from '../domain/outbound.types'

export interface LastTestResponse {
  endpointId: string
  raw: unknown
  timestamp: string
}

export interface UiState {
  viewMode: 'admin' | 'user'
}

/**
 * The single object persisted to localStorage (minus AuthConfig['session'] for
 * oauth2, which is stripped before serialization — see lib/persistence).
 */
export interface RootState {
  connector: ConnectorConfig
  auth: AuthConfig
  endpoints: EndpointDefinition[]
  history: RequestHistoryEntry[]
  fieldMappings: FieldMapping[]
  lastTestResponse?: LastTestResponse
  outbound: OutboundConfig
  ui: UiState
}
