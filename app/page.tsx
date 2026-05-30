'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { initializeStorage } from '@/lib/storage';
import { initializeUsers, isAuthenticated, getCurrentUser } from '@/lib/auth';
import { sanPhamService } from '@/services/sanPhamService';
import { dichVuService } from '@/services/dichVuService';
import { gioHangService } from '@/services/gioHangService';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    initializeUsers();

    const fetchData = async () => {
      try {
        const [resProducts, resServices] = await Promise.all([
          sanPhamService.getAllSanPham(),
          dichVuService.getAllDichVu()
        ]);

        const prodData = Array.isArray(resProducts.data?.data) 
          ? resProducts.data.data 
          : (Array.isArray(resProducts.data) ? resProducts.data : []);

        // Xử lý riêng cho dịch vụ
        const servData = Array.isArray(resServices) ? resServices : [];

        setProducts(prodData.slice(0, 4));
        setServices(servData.slice(0, 3));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert(t('common.messages.loginRequired'));
      router.push('/login');
      return;
    }

    try {
      const user = getCurrentUser() as any;
      await gioHangService.save({
        maUser: String(user.userID),
        maSP: String(productId),
        soLuong: 1
      });
      window.dispatchEvent(new Event('cartUpdate'));
      alert(t('common.messages.addProductSuccess'));
    } catch (error) {
      console.error("Lỗi khi thêm giỏ hàng:", error);
      alert(t('common.messages.genericError'));
    }
  };

  const formatPrice = (value: number) =>
    `${Number(value).toLocaleString(t('common.currency.locale'))} ${t('common.currency.suffix')}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('home.hero.title')}</h1>
                <p className="text-lg text-gray-700 mb-6">{t('home.hero.description')}</p>
                <div className="flex gap-4">
                  <Link href="/products"><Button className="bg-orange-600 hover:bg-orange-700 text-white px-8">{t('home.hero.shop')}</Button></Link>
                  <Link href="/services"><Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8">{t('home.hero.services')}</Button></Link>
                </div>
              </div>
              <div className="bg-orange-200 h-80 rounded-lg flex items-center justify-center"><div className="text-6xl">🐶🐱</div></div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.featuredProducts.title')}</h2>
              <p className="text-gray-600 text-lg">{t('home.featuredProducts.description')}</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.maSP} href={`/products/${product.maSP}`}>
                  <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                    <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400">📦</div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.tenSP}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.moTa || t('common.fallbacks.qualityProduct')}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-orange-600">{formatPrice(product.gia)}</span>
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={(e) => handleAddToCart(e, product.maSP)}>
                        <ShoppingCart className="w-4 h-4 mr-2" /> {t('common.actions.addToCart')}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8"><Link href="/products"><Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">{t('home.featuredProducts.viewAll')}</Button></Link></div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('home.featuredServices.title')}</h2>
              <p className="text-gray-600 text-lg">{t('home.featuredServices.description')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.maDV} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-2xl">✂️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.tenDV}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.moTa}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-orange-600">{formatPrice(service.gia)}</span>
                  </div>
                  <Link href={`/services/${service.maDV}`}><Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">{t('common.actions.bookNow')}</Button></Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8"><Link href="/services"><Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">{t('home.featuredServices.viewAll')}</Button></Link></div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('home.why.title')}</h2></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: '🏆', title: t('home.why.items.0.title'), desc: t('home.why.items.0.desc') },
                { icon: '👨‍⚕️', title: t('home.why.items.1.title'), desc: t('home.why.items.1.desc') },
                { icon: '💰', title: t('home.why.items.2.title'), desc: t('home.why.items.2.desc') },
                { icon: '📞', title: t('home.why.items.3.title'), desc: t('home.why.items.3.desc') },
              ].map((item, i) => (
                <div key={i} className="text-center p-6 border rounded-lg">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-orange-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
            <Link href="/products"><Button className="bg-white text-orange-600 hover:bg-orange-50 px-8">{t('common.actions.exploreNow')}</Button></Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
