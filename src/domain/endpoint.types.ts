export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export const SCHEMA_FIELD_TYPES = ['String', 'Number', 'Boolean', 'Date', 'Object'] as const
export type SchemaFieldType = (typeof SCHEMA_FIELD_TYPES)[number]

export interface KeyValueRow {
  id: string
  key: string
  value: string
}

export interface ResponseSchemaField {
  id: string
  fieldName: string
  /** e.g. $.data[*].id */
  jsonPath: string
  dataType: SchemaFieldType
  required: boolean
}

export interface EndpointDefinition {
  id: string
  label: string
  method: HttpMethod
  /** May contain {{variable}} placeholders. */
  path: string
  description?: string
  headers: KeyValueRow[]
  queryParams: KeyValueRow[]
  /** Raw JSON text. Only relevant for POST/PUT/PATCH. */
  requestBody?: string
  responseSchema: ResponseSchemaField[]
  createdAt: string
  updatedAt: string
}

export function methodHasBody(method: HttpMethod): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH'
}
