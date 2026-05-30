'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  LANGUAGE_STORAGE_KEY,
} from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const initialLanguage = isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;

    if (i18n.language !== initialLanguage) {
      void i18n.changeLanguage(initialLanguage);
    }

    document.documentElement.lang = initialLanguage;

    const handleLanguageChange = (language: string) => {
      if (!isSupportedLanguage(language)) {
        return;
      }

      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language;
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
