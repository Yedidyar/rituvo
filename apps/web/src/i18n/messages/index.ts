import type { Locale } from "../config";
import { en } from "./en";
import { he } from "./he";

type WidenStrings<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: WidenStrings<T[K]> }
    : T;

export type Messages = WidenStrings<typeof en>;

export const messages: Record<Locale, Messages> = {
  en,
  he,
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
