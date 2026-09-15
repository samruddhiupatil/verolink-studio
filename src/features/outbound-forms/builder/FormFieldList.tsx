import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { OutboundFormField } from '../../../domain/outbound.types'
import { FormFieldEditor } from './FormFieldEditor'
import styles from './OutboundFormBuilderPage.module.css'

interface SortableFieldCardProps {
  field: OutboundFormField
  onChange: (field: OutboundFormField) => void
  onRemove: () => void
}

function SortableFieldCard({ field, onChange, onRemove }: SortableFieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className={styles.fieldCard}>
      <button type="button" className={styles.dragHandle} aria-label="Drag to reorder" {...attributes} {...listeners}>
        ⠿
      </button>
      <FormFieldEditor field={field} onChange={onChange} onRemove={onRemove} />
    </div>
  )
}

interface FormFieldListProps {
  fields: OutboundFormField[]
  onChange: (fields: OutboundFormField[]) => void
}

/** Drag-and-drop reorderable field list — dnd-kit's keyboard sensor makes this reachable/testable without native HTML5 drag events. */
export function FormFieldList({ fields, onChange }: FormFieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function updateField(next: OutboundFormField) {
    onChange(fields.map((f) => (f.id === next.id ? next : f)))
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id).map((f, index) => ({ ...f, order: index })))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...fields]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onChange(reordered.map((f, index) => ({ ...f, order: index })))
  }

  if (fields.length === 0) return <p className={styles.empty}>No fields yet. Add one to get started.</p>

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.fieldList}>
          {fields.map((field) => (
            <SortableFieldCard key={field.id} field={field} onChange={updateField} onRemove={() => removeField(field.id)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
