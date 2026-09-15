import { Badge, type BadgeTone } from './Badge'

/** Green 2xx, amber 3xx, red 4xx/5xx/no-response — per spec's Section 4 response pane. */
function toneForStatus(status: number | null): BadgeTone {
  if (status === null) return 'danger'
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  return 'danger'
}

export function StatusPill({ status }: { status: number | null }) {
  return <Badge tone={toneForStatus(status)}>{status === null ? 'No response' : status}</Badge>
}
