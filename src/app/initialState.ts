import { createDefaultAuthConfig } from '../domain/auth.types'
import { createDefaultConnectorConfig } from '../domain/connector.types'
import { createDefaultOutboundConfig } from '../domain/outbound.types'
import type { RootState } from './appState.types'

export function createInitialRootState(): RootState {
  return {
    connector: createDefaultConnectorConfig(),
    auth: createDefaultAuthConfig(),
    endpoints: [],
    history: [],
    fieldMappings: [],
    lastTestResponse: undefined,
    outbound: createDefaultOutboundConfig(),
    ui: { viewMode: 'admin' },
  }
}
