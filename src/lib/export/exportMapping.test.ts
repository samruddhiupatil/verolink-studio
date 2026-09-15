import { describe, expect, it } from 'vitest'
import { createDefaultConnectorConfig } from '../../domain/connector.types'
import type { FieldMapping } from '../../domain/mapping.types'
import { buildMappingExport } from './exportMapping'

describe('buildMappingExport', () => {
  it('builds a self-describing export document with schema version and connector identity', () => {
    const connector = { ...createDefaultConnectorConfig(), name: 'Vendor Sync', versionTag: 'v1.2', targetSystem: 'Salesforce' as const }
    const mappings: FieldMapping[] = [
      { id: 'm1', sourceJsonPath: '$.email', canonicalField: 'vendor_email', transform: { type: 'lowercase' } },
    ]

    const result = buildMappingExport(connector, mappings)

    expect(result.schemaVersion).toBe(1)
    expect(result.connector).toEqual({ name: 'Vendor Sync', versionTag: 'v1.2', targetSystem: 'Salesforce' })
    expect(result.mappings).toEqual([{ sourcePath: '$.email', canonicalField: 'vendor_email', transform: { type: 'lowercase' } }])
    expect(result.exportedAt).toBeTruthy()
  })

  it('produces an empty mappings array when there are no mappings yet', () => {
    const result = buildMappingExport(createDefaultConnectorConfig(), [])
    expect(result.mappings).toEqual([])
  })
})
