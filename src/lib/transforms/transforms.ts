import { format, isValid, parseISO } from 'date-fns'
import type { TransformConfig, TransformType } from '../../domain/mapping.types'

type TransformFn = (value: string, arg?: string) => string

const TRANSFORM_REGISTRY: Record<TransformType, TransformFn> = {
  none: (value) => value,
  uppercase: (value) => value.toUpperCase(),
  lowercase: (value) => value.toLowerCase(),
  trim: (value) => value.trim(),
  dateFormatIsoToDMY: (value) => {
    const parsed = parseISO(value)
    if (!isValid(parsed)) return value
    return format(parsed, 'dd/MM/yyyy')
  },
  prefix: (value, arg) => `${arg ?? ''}${value}`,
  suffix: (value, arg) => `${value}${arg ?? ''}`,
}

/**
 * Coerces any resolved field value to a string before transforming — transforms
 * are defined over text (per spec: Uppercase/Lowercase/Trim/Date Format/Prefix/Suffix),
 * so a non-string source value (number, boolean) is stringified first.
 */
function toTransformableString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return String(value)
}

export function applyTransform(value: unknown, config: TransformConfig): string {
  const input = toTransformableString(value)
  return TRANSFORM_REGISTRY[config.type](input, config.arg)
}
