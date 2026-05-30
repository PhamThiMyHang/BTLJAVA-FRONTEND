'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { FileText, UserCheck, CreditCard, RotateCcw, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
  const { t } = useTranslation();
  const accountItems = t('termsPage.accountItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <FileText className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('termsPage.title')}</h1>
          </div>

          <div className="prose prose-lg text-gray-700 leading-relaxed max-w-none space-y-12">
            
            <div className="bg-white rounded-3xl shadow-sm p-10 border border-orange-100">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-orange-600" /> {t('termsPage.acceptTitle')}
              </h2>
              <p className="text-lg">
                {t('termsPage.acceptText')}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" /> {t('termsPage.accountTitle')}
              </h2>
              <ul className="space-y-4 text-lg">
                {accountItems.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-10">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-orange-600" /> {t('termsPage.paymentTitle')}
              </h2>
              <p className="text-lg leading-relaxed">
                {t('termsPage.paymentText')}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <RotateCcw className="w-8 h-8 text-orange-600" /> {t('termsPage.refundTitle')}
              </h2>
              <p className="text-lg leading-relaxed bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                {t('termsPage.refundText')}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" /> {t('termsPage.responsibilityTitle')}
              </h2>
              <p className="text-lg">
                {t('termsPage.responsibilityText')}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" /> {t('termsPage.liabilityTitle')}
              </h2>
              <p className="text-lg">
                {t('termsPage.liabilityText')}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-10">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <RefreshCw className="w-8 h-8 text-orange-600" /> {t('termsPage.changesTitle')}
              </h2>
              <p className="text-lg">
                {t('termsPage.changesText')}
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-3xl p-10 text-center">
              <p className="text-xl font-medium">
                {t('termsPage.noticePrefix')}{' '}
                <span className="font-bold">{t('termsPage.termsLabel')}</span> {t('termsPage.and')}{' '}
                <span className="font-bold">{t('termsPage.privacyLabel')}</span>.
              </p>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
