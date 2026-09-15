import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { EndpointDefinition } from '../../domain/endpoint.types'
import styles from './EndpointTable.module.css'

type SortColumn = 'label' | 'method' | 'path'
type SortDirection = 'asc' | 'desc'

interface EndpointTableProps {
  endpoints: EndpointDefinition[]
  searchQuery: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export function EndpointTable({ endpoints, searchQuery, onEdit, onDelete, onDuplicate }: EndpointTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('label')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const visibleEndpoints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = query
      ? endpoints.filter((e) => e.label.toLowerCase().includes(query) || e.path.toLowerCase().includes(query))
      : endpoints

    const sorted = [...filtered].sort((a, b) => {
      const result = a[sortColumn].localeCompare(b[sortColumn])
      return sortDirection === 'asc' ? result : -result
    })
    return sorted
  }, [endpoints, searchQuery, sortColumn, sortDirection])

  function sortIndicator(column: SortColumn) {
    if (column !== sortColumn) return ''
    return sortDirection === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>
            <button type="button" className={styles.sortable} onClick={() => toggleSort('label')}>
              Label{sortIndicator('label')}
            </button>
          </th>
          <th>
            <button type="button" className={styles.sortable} onClick={() => toggleSort('method')}>
              Method{sortIndicator('method')}
            </button>
          </th>
          <th>
            <button type="button" className={styles.sortable} onClick={() => toggleSort('path')}>
              Path{sortIndicator('path')}
            </button>
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        {visibleEndpoints.map((endpoint) => (
          <tr key={endpoint.id}>
            <td>{endpoint.label}</td>
            <td>
              <Badge tone="accent">{endpoint.method}</Badge>
            </td>
            <td className={styles.path}>{endpoint.path}</td>
            <td>
              <div className={styles.actions}>
                <Button variant="ghost" size="sm" onClick={() => onEdit(endpoint.id)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(endpoint.id)}>
                  Duplicate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(endpoint.id)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
