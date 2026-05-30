import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

export const LANGUAGE_STORAGE_KEY = 'appLanguage';
export const DEFAULT_LANGUAGE = 'vi';
export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(language: string | null): language is SupportedLanguage {
  return Boolean(language && SUPPORTED_LANGUAGES.includes(language as SupportedLanguage));
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
