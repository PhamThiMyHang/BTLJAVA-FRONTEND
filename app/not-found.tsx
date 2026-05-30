'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <div className="text-6xl mb-6">🐾</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('notFound.title')}
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            {t('notFound.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8">
                {t('notFound.home')}
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8">
                {t('notFound.products')}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
