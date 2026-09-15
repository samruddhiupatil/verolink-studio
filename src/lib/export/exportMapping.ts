import type { ConnectorConfig } from '../../domain/connector.types'
import type { ConnectorMappingExport } from '../../domain/fieldMapping.types'
import type { FieldMapping } from '../../domain/mapping.types'

/** Pure builder for the connector-mapping.json export document — see fieldMapping.types.ts for the shape rationale. */
export function buildMappingExport(connector: ConnectorConfig, mappings: FieldMapping[]): ConnectorMappingExport {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    connector: {
      name: connector.name,
      versionTag: connector.versionTag,
      targetSystem: connector.targetSystem,
    },
    mappings: mappings.map((mapping) => ({
      sourcePath: mapping.sourceJsonPath,
      canonicalField: mapping.canonicalField,
      transform: mapping.transform,
    })),
  }
}

/** Triggers a browser download of `data` as a formatted JSON file. DOM side effect — not unit tested. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
