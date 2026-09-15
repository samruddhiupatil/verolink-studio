import { nanoid } from 'nanoid'
import { Button } from './Button'
import { Input } from './Input'
import styles from './KeyValueRowsEditor.module.css'

export interface KeyValueRowLike {
  id: string
  key: string
  value: string
}

interface KeyValueRowsEditorProps<T extends KeyValueRowLike> {
  rows: T[]
  onChange: (rows: T[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  addLabel?: string
  emptyMessage?: string
}

/** Addable/removable key-value rows — shared by Section 2 custom headers and Section 3 headers/query params. */
export function KeyValueRowsEditor<T extends KeyValueRowLike>({
  rows,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  addLabel = 'Add row',
  emptyMessage = 'No rows yet.',
}: KeyValueRowsEditorProps<T>) {
  function updateRow(id: string, patch: Partial<KeyValueRowLike>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function removeRow(id: string) {
    onChange(rows.filter((row) => row.id !== id))
  }

  function addRow() {
    onChange([...rows, { id: nanoid(), key: '', value: '' } as T])
  }

  return (
    <div className={styles.wrapper}>
      {rows.length === 0 && <p className={styles.empty}>{emptyMessage}</p>}
      {rows.map((row) => (
        <div key={row.id} className={styles.row}>
          <Input
            value={row.key}
            onChange={(event) => updateRow(row.id, { key: event.target.value })}
            placeholder={keyPlaceholder}
            aria-label={keyPlaceholder}
          />
          <Input
            value={row.value}
            onChange={(event) => updateRow(row.id, { value: event.target.value })}
            placeholder={valuePlaceholder}
            aria-label={valuePlaceholder}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.id)} aria-label="Remove row">
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        + {addLabel}
      </Button>
    </div>
  )
}
