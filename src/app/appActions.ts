import type { AuthConfig } from '../domain/auth.types'
import type { ConnectionHealthResult, ConnectorConfig } from '../domain/connector.types'
import type { EndpointDefinition } from '../domain/endpoint.types'
import type { RequestHistoryEntry } from '../domain/history.types'
import type { FieldMapping } from '../domain/mapping.types'
import type { OutboundFormField, OutboundMappingEntry } from '../domain/outbound.types'
import type { LastTestResponse } from './appState.types'

export type AppAction =
  | { type: 'UPDATE_CONNECTOR'; payload: Partial<ConnectorConfig> }
  | { type: 'SET_CONNECTION_HEALTH'; payload: ConnectionHealthResult }
  | { type: 'SET_AUTH'; payload: AuthConfig }
  | { type: 'ADD_ENDPOINT'; payload: EndpointDefinition }
  | { type: 'UPDATE_ENDPOINT'; payload: EndpointDefinition }
  | { type: 'DELETE_ENDPOINT'; payload: { id: string } }
  | { type: 'SET_LAST_TEST_RESPONSE'; payload: LastTestResponse | undefined }
  | { type: 'APPEND_HISTORY_ENTRY'; payload: RequestHistoryEntry }
  | { type: 'SET_FIELD_MAPPINGS'; payload: FieldMapping[] }
  | { type: 'SET_OUTBOUND_FIELDS'; payload: OutboundFormField[] }
  | { type: 'SET_OUTBOUND_MAPPINGS'; payload: OutboundMappingEntry[] }
  | { type: 'SET_OUTBOUND_TARGET_ENDPOINT'; payload: string | undefined }
  | { type: 'SET_VIEW_MODE'; payload: 'admin' | 'user' }
