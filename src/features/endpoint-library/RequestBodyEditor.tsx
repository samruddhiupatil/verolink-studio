import { FormField } from '../../components/ui/FormField'
import { Textarea } from '../../components/ui/Textarea'
import { type HttpMethod, methodHasBody } from '../../domain/endpoint.types'
import { validateJsonText } from '../../lib/validation/jsonValidation'

interface RequestBodyEditorProps {
  method: HttpMethod
  value: string
  onChange: (value: string) => void
}

/** JSON textarea shown only for POST/PUT/PATCH, with inline syntax validation. */
export function RequestBodyEditor({ method, value, onChange }: RequestBodyEditorProps) {
  if (!methodHasBody(method)) return null

  const validation = validateJsonText(value)

  return (
    <FormField label="Request Body" htmlFor="endpoint-request-body" hint="JSON" error={validation.valid ? undefined : validation.error}>
      <Textarea
        id="endpoint-request-body"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        mono
        hasError={!validation.valid}
        placeholder={'{\n  "title": "{{title}}"\n}'}
      />
    </FormField>
  )
}
