'use client';

import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'vi';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value as SupportedLanguage);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <Languages className="h-4 w-4 text-orange-600" aria-hidden="true" />
      <span className="sr-only">{t('common.language.label')}</span>
      <select
        value={currentLanguage}
        onChange={handleChange}
        aria-label={t('common.language.label')}
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-700 outline-none transition hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      >
        <option value="vi">{t('common.language.vi')}</option>
        <option value="en">{t('common.language.en')}</option>
      </select>
    </label>
  );
}
