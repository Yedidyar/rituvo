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
  return function translate(
    key: TranslationKey,
    values?: InterpolationValues,
  ): string {
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
  const segments = path.split('.')
  let current: unknown = obj

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment]
      continue
    }

    return undefined
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) {
    return template
  }

  return template.replaceAll(/{{(\w+)}}/g, (_, key: string) => {
    const value = values[key]
    return value === undefined ? `{{${key}}}` : String(value)
  })
}
