import { useState } from 'react'
import styles from './JsonTree.module.css'

interface JsonTreeProps {
  data: unknown
  /** When provided, leaf (scalar) values become clickable — used by Section 5's source field tree. */
  onSelectLeaf?: (path: string, value: unknown) => void
}

export function JsonTree({ data, onSelectLeaf }: JsonTreeProps) {
  return (
    <div className={styles.tree}>
      <JsonNode value={data} path="$" depth={0} onSelectLeaf={onSelectLeaf} />
    </div>
  )
}

function LeafValue({ value, path, onSelectLeaf }: { value: unknown; path: string; onSelectLeaf?: (path: string, value: unknown) => void }) {
  const rendered =
    value === null ? (
      <span className={styles.null}>null</span>
    ) : typeof value === 'string' ? (
      <span className={styles.string}>"{value}"</span>
    ) : typeof value === 'number' ? (
      <span className={styles.number}>{value}</span>
    ) : typeof value === 'boolean' ? (
      <span className={styles.boolean}>{String(value)}</span>
    ) : (
      <span>{String(value)}</span>
    )

  if (!onSelectLeaf) return rendered
  return (
    <button
      type="button"
      className={styles.selectable}
      onClick={() => onSelectLeaf(path, value)}
      title={`Map ${path}`}
    >
      {rendered}
    </button>
  )
}

function JsonNode({
  value,
  path,
  depth,
  onSelectLeaf,
}: {
  value: unknown
  path: string
  depth: number
  onSelectLeaf?: (path: string, value: unknown) => void
}) {
  const [collapsed, setCollapsed] = useState(depth >= 2)

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={styles.bracket}>[]</span>
    return (
      <span>
        <button type="button" className={styles.toggle} onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className={styles.bracket}>[{collapsed ? `${value.length} items` : ''}</span>
        {!collapsed && (
          <div className={styles.indent}>
            {value.map((item, index) => (
              <div key={index} className={styles.leafRow}>
                <span className={styles.key}>{index}:</span>
                <JsonNode value={item} path={`${path}[${index}]`} depth={depth + 1} onSelectLeaf={onSelectLeaf} />
              </div>
            ))}
          </div>
        )}
        {!collapsed && <span className={styles.bracket}>]</span>}
      </span>
    )
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return <span className={styles.bracket}>{'{}'}</span>
    return (
      <span>
        <button type="button" className={styles.toggle} onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className={styles.bracket}>{'{'}{collapsed ? `${entries.length} keys` : ''}</span>
        {!collapsed && (
          <div className={styles.indent}>
            {entries.map(([key, entryValue]) => (
              <div key={key} className={styles.leafRow}>
                <span className={styles.key}>{key}:</span>
                <JsonNode value={entryValue} path={`${path}.${key}`} depth={depth + 1} onSelectLeaf={onSelectLeaf} />
              </div>
            ))}
          </div>
        )}
        {!collapsed && <span className={styles.bracket}>{'}'}</span>}
      </span>
    )
  }

  return <LeafValue value={value} path={path} onSelectLeaf={onSelectLeaf} />
}
