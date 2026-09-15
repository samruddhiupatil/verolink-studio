import { KeyValueRowsEditor } from '../../components/ui/KeyValueRowsEditor'
import type { AuthConfig } from '../../domain/auth.types'

interface CustomHeaderRowsProps {
  auth: Extract<AuthConfig, { type: 'customHeaders' }>
  onChange: (next: AuthConfig) => void
}

export function CustomHeaderRows({ auth, onChange }: CustomHeaderRowsProps) {
  return (
    <KeyValueRowsEditor
      rows={auth.headers}
      onChange={(headers) => onChange({ ...auth, headers })}
      keyPlaceholder="Header name"
      valuePlaceholder="Header value"
      addLabel="Add header"
      emptyMessage="No custom headers yet."
    />
  )
}
