import en from "./messages/en.json" with { type: "json" };
import ko from "./messages/ko.json" with { type: "json" };
import type { Locale } from "./ui";

export type MessageDictionary = Record<keyof typeof en, string>;

export const messages = { en, ko } satisfies Record<Locale, MessageDictionary>;
