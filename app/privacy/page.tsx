'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Shield, Eye, Lock, Users, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();
  const infoItems = t('privacy.infoItems', { returnObjects: true }) as string[];
  const purposeItems = t('privacy.purposeItems', { returnObjects: true }) as string[];
  const rightsItems = t('privacy.rightsItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('privacy.title')}</h1>
          </div>

          <div className="prose prose-lg text-gray-700 leading-relaxed max-w-none">
            <div className="bg-white rounded-3xl shadow-sm p-10 mb-10 border border-orange-100">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-600" /> {t('privacy.introTitle')}
              </h2>
              <p className="text-lg">
                {t('privacy.introText')}
              </p>
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">{t('privacy.infoTitle')}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {infoItems.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">{t('privacy.purposeTitle')}</h2>
                <ul className="space-y-4">
                  {purposeItems.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <Lock className="w-8 h-8 text-orange-600" /> {t('privacy.securityTitle')}
                </h2>
                <p className="text-lg leading-relaxed">
                  {t('privacy.securityText')}
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">{t('privacy.rightsTitle')}</h2>
                <ul className="list-disc pl-6 space-y-3 text-lg">
                  {rightsItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-16 bg-white rounded-3xl p-10 shadow-sm border">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                <Phone className="w-8 h-8 text-orange-600" /> {t('privacy.contactTitle')}
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Mail className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <p className="font-medium">support@petshop.com</p>
                </div>
                <div>
                  <Phone className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <p className="font-medium">0901 234 567</p>
                </div>
                <div>
                  <p className="font-medium" dangerouslySetInnerHTML={{ __html: t('privacy.address') }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
