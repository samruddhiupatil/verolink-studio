import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { SegmentedToggle } from '../../components/ui/SegmentedToggle'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { TARGET_SYSTEMS, type ConnectorConfig } from '../../domain/connector.types'
import { isWellFormedUrl } from '../../lib/validation/urlValidation'
import styles from './ConnectorIdentityPage.module.css'

interface ConnectorFormProps {
  connector: ConnectorConfig
  onChange: (patch: Partial<ConnectorConfig>) => void
}

export function ConnectorForm({ connector, onChange }: ConnectorFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))

  const nameError = touched.name && !connector.name.trim() ? 'Connector name is required.' : undefined
  const baseUrlError = touched.baseUrl
    ? !connector.baseUrl.trim()
      ? 'Base URL is required.'
      : !isWellFormedUrl(connector.baseUrl)
        ? 'Enter a well-formed URL, e.g. https://api.example.com'
        : undefined
    : undefined

  return (
    <div className={styles.grid}>
      <FormField label="Connector Name" htmlFor="connector-name" required error={nameError}>
        <Input
          id="connector-name"
          value={connector.name}
          onChange={(event) => onChange({ name: event.target.value })}
          onBlur={() => markTouched('name')}
          placeholder="e.g. NetSuite Vendor Sync"
          hasError={Boolean(nameError)}
        />
      </FormField>

      <FormField label="Version Tag" htmlFor="connector-version" hint="e.g. v1.2">
        <Input
          id="connector-version"
          value={connector.versionTag}
          onChange={(event) => onChange({ versionTag: event.target.value })}
          placeholder="v1.0"
        />
      </FormField>

      <FormField label="Target System" htmlFor="connector-target-system">
        <Select
          id="connector-target-system"
          value={connector.targetSystem}
          onChange={(event) => onChange({ targetSystem: event.target.value as ConnectorConfig['targetSystem'] })}
        >
          {TARGET_SYSTEMS.map((system) => (
            <option key={system} value={system}>
              {system}
            </option>
          ))}
        </Select>
        {connector.targetSystem === 'Custom' && (
          <div className={styles.customSystemRow}>
            <Input
              value={connector.customTargetSystemName ?? ''}
              onChange={(event) => onChange({ customTargetSystemName: event.target.value })}
              placeholder="Name your target system"
              aria-label="Custom target system name"
            />
          </div>
        )}
      </FormField>

      <FormField label="Environment" htmlFor="connector-environment">
        <div id="connector-environment">
          <SegmentedToggle
            ariaLabel="Environment"
            value={connector.environment}
            onChange={(value) => onChange({ environment: value })}
            options={[
              { value: 'Sandbox', label: 'Sandbox' },
              { value: 'Production', label: 'Production' },
            ]}
          />
          <span style={{ marginLeft: 8 }}>
            <Badge tone={connector.environment === 'Production' ? 'production' : 'sandbox'}>
              {connector.environment}
            </Badge>
          </span>
        </div>
      </FormField>

      <div className={styles.gridFull}>
        <FormField label="Base URL" htmlFor="connector-base-url" required error={baseUrlError}>
          <Input
            id="connector-base-url"
            value={connector.baseUrl}
            onChange={(event) => onChange({ baseUrl: event.target.value })}
            onBlur={() => markTouched('baseUrl')}
            placeholder="https://api.example.com"
            hasError={Boolean(baseUrlError)}
            mono
          />
        </FormField>
      </div>

      <div className={styles.gridFull}>
        <FormField label="Description" htmlFor="connector-description" hint="Optional">
          <Textarea
            id="connector-description"
            value={connector.description ?? ''}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={3}
          />
        </FormField>
      </div>
    </div>
  )
}
