'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, Clock, Calendar, ArrowLeft, Heart, Share2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { dichVuService } from '@/services/dichVuService';
import { getCurrentUser } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { ServiceImage } from '@/components/ServiceImage';

// === HÀM FORMAT GIÁ ĐÃ SỬA ===
const formatPrice = (gia: number | string, locale: string): string => {
  const num = Number(gia || 0);
  
  if (num === 0) return '0K';

  if (num < 10000) {
    return Math.round(num) + 'K';
  }

  return Math.round(num / 1000).toLocaleString(locale) + 'K';
};

export default function ServiceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const maDV = params?.id as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!maDV) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        const data = await dichVuService.getDichVuById(maDV);
        const serviceData = data.data || data;
        setService(serviceData);
      } catch (err: any) {
        console.error(err);
        setError(t('serviceDetail.notFound'));
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [maDV]);

  const handleAddToCart = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert(t('serviceDetail.loginRequired'));
      router.push('/login');
      return;
    }

    if (!service) return;

    const serviceCart = JSON.parse(localStorage.getItem('serviceCart') || '[]');

    const newService = {
      id: Date.now(),
      serviceId: service.maDV,
      name: service.tenDV,
      price: service.gia,
      gia: service.gia,
      category: service.category,
      date: new Date().toISOString().split('T')[0],
      time: "09:00"
    };

    serviceCart.push(newService);
    localStorage.setItem('serviceCart', JSON.stringify(serviceCart));

    setAddedToCart(true);
    setTimeout(() => {
      alert(t('serviceDetail.added', { name: service.tenDV }));
      setAddedToCart(false);
    }, 600);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">{t('common.loading.default')}</div>;

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600 text-2xl">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">{t('productDetail.home')}</Link> /
            <Link href="/services" className="hover:text-orange-600">{t('common.nav.services')}</Link> /
            <span className="text-gray-900 font-medium">{service.tenDV}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100">
                <ServiceImage service={service} />
              </div>
            </div>

            <div className="space-y-8">
              <span className="inline-block px-5 py-2 bg-orange-100 text-orange-700 font-semibold rounded-full">
                {service.category?.toUpperCase() || t('serviceDetail.serviceFallback')}
              </span>

              <h1 className="text-5xl font-bold text-gray-900">{service.tenDV}</h1>

              <div className="text-5xl font-bold text-orange-600">
                {formatPrice(service.gia, t('common.currency.locale'))}
              </div>

              <div className="prose text-gray-600 text-lg">
                {service.moTa}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-7 rounded-2xl flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-6 h-6" />
                {addedToCart ? t('serviceDetail.adding') : t('serviceDetail.addToCart')}
              </Button>

              <Link href="/services">
                <Button variant="outline" className="w-full py-6 text-lg">
                  <ArrowLeft className="mr-2" /> {t('serviceDetail.backToServices')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
