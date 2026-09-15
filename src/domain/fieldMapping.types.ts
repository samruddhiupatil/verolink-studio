import type { CanonicalFieldKey } from './canonicalSchema'
import type { TransformConfig } from './mapping.types'

/**
 * Shape of the downloadable `connector-mapping.json` file produced by Section 5's
 * export button. Self-describing (carries connector identity, a schema version,
 * and an export timestamp) rather than a bare array, so the file is meaningful
 * on its own outside the app.
 */
export interface ConnectorMappingExport {
  schemaVersion: 1
  exportedAt: string
  connector: {
    name: string
    versionTag: string
    targetSystem: string
  }
  mappings: Array<{
    sourcePath: string
    canonicalField: CanonicalFieldKey
    transform: TransformConfig
  }>
}
