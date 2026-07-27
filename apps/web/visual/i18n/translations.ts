import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { kn } from "./locales/kn";

export type LanguageCode = "en" | "hi" | "kn";

export interface LanguageOption {
  code: LanguageCode;
  symbol: string;
  name: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", symbol: "A", name: "English" },
  { code: "hi", symbol: "अ", name: "हिन्दी" },
  { code: "kn", symbol: "ಅ", name: "ಕನ್ನಡ" },
];

export const translations: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  kn,
};
