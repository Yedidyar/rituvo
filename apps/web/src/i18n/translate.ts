import type { Messages } from './messages'

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never

export type TranslationKey = NestedKeyOf<Messages>

type InterpolationValues = Record<string, string | number>

export function createTranslator(messages: Messages) {
  return function t(key: TranslationKey, values?: InterpolationValues): string {
    const template = getNestedValue(
      messages as unknown as Record<string, unknown>,
      key,
    )

    if (!template) {
      return key
    }

    return interpolate(template, values)
  }
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  const value = path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment]
    }
    return undefined
  }, obj)

  return typeof value === 'string' ? value : undefined
}

function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) {
    return template
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = values[key]
    return value === undefined ? `{{${key}}}` : String(value)
  })
}
