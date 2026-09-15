export const TARGET_SYSTEMS = [
  'SAP S/4HANA',
  'Oracle NetSuite',
  'Workday',
  'Salesforce',
  'Custom',
] as const

export type TargetSystem = (typeof TARGET_SYSTEMS)[number]

/** See RequestErrorKind in history.types.ts for why this is collapsed to two values. */
export type ConnectionErrorKind = 'timeout' | 'unreachable'

export interface ConnectionHealthResult {
  timestamp: string
  reachable: boolean
  latencyMs?: number
  errorKind?: ConnectionErrorKind
}

export interface ConnectorConfig {
  name: string
  versionTag: string
  targetSystem: TargetSystem
  /** Free-entry name, only meaningful when targetSystem === 'Custom'. */
  customTargetSystemName?: string
  baseUrl: string
  environment: 'Sandbox' | 'Production'
  description?: string
  lastHealthCheck?: ConnectionHealthResult
}

export function createDefaultConnectorConfig(): ConnectorConfig {
  return {
    name: '',
    versionTag: '',
    targetSystem: 'Custom',
    baseUrl: '',
    environment: 'Sandbox',
    description: '',
  }
}
