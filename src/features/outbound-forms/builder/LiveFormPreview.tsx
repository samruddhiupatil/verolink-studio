import type { OutboundFormField } from '../../../domain/outbound.types'
import { OutboundFieldRenderer } from '../OutboundFieldRenderer'
import styles from './OutboundFormBuilderPage.module.css'

/** Renders the form fields in real time, exactly as an end user would see them (Part C reuses the same renderer). */
export function LiveFormPreview({ fields }: { fields: OutboundFormField[] }) {
  if (fields.length === 0) return <p className={styles.empty}>Add fields to see the live preview.</p>

  return (
    <div className={styles.previewForm}>
      {fields.map((field) => (
        <OutboundFieldRenderer key={field.id} field={field} value={field.placeholderOrDefault ?? ''} disabled />
      ))}
    </div>
  )
}
