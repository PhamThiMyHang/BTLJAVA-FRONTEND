'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Package, Calendar, Heart, Settings, RefreshCw } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { donHangService } from '@/services/donHangService';
import { petService } from '@/services/petService';
import { useTranslation } from 'react-i18next';

interface DonHang {
  id: string | number;
  maDH?: string;
  tenKhachHang?: string;
  tongTien?: number;
  trangThai?: string;
  ngayTao?: string;
  createdAt?: string;
}

interface Pet {
  id: string | number;
  name?: string;
  tenThuCung?: string;
  type?: string;
  breed?: string;
  giong?: string;
  age?: number;
  tuoi?: number;
  weight?: number;
}

interface Booking {
  id: string | number;
  serviceName?: string;
  tenDichVu?: string;
  date?: string;
  time?: string;
  price?: number;
  gia?: number;
  status?: string;
  trangThai?: string;
}

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    fetchCustomerData(user.id || (user as any).maKH); // Sửa lỗi ở đây
  }, [router]);

  const fetchCustomerData = async (customerId?: string | number) => {
    try {
      setLoading(true);

      // Lấy đơn hàng của khách hàng
      const ordersRes = await donHangService.searchDonHangs({
        size: 10,
        sort: 'ngayTao,desc',
      });
      setOrders(ordersRes.data?.content || ordersRes.data || []);

      // Lấy danh sách thú cưng của khách hàng từ API
      try {
        const petsRes = await petService.searchPets({ maKH: customerId });
        const petsData = petsRes.data;
        if (Array.isArray(petsData)) {
          setPets(petsData);
        } else if (petsData?.content) {
          setPets(petsData.content);
        } else {
          setPets([]);
        }
      } catch (petErr) {
        console.error('Lỗi tải thú cưng:', petErr);
        setPets([]);
      }

    } catch (error) {
      console.error('Lỗi khi tải dashboard khách hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    const st = (status || '').toUpperCase();
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPING: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[st] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status?: string) => {
    const st = (status || '').toUpperCase();
    const labels: Record<string, string> = {
      COMPLETED: t('common.status.completed'),
      PENDING: t('dashboard.staff.pending'),
      PROCESSING: t('common.status.processing'),
      SHIPPING: t('dashboard.staff.shipping'),
      CANCELLED: t('common.status.cancelled'),
    };
    return labels[st] || status || t('common.status.unknown');
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-lg">{t('dashboard.customer.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Welcome Header */}
        <section className="bg-orange-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('dashboard.customer.welcome', { name: currentUser.name })} 👋
                </h1>
                <p className="text-gray-600 mt-2">{currentUser.email}</p>
              </div>
              <Link href="/customer/settings">
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t('dashboard.customer.settings')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '🛍️', label: t('dashboard.customer.orders'), value: orders.length },
              { icon: '📅', label: t('dashboard.customer.bookedServices'), value: bookings.length || 0 },
              { icon: '🐾', label: t('dashboard.customer.pets'), value: pets.length || 0 },
              { icon: '⭐', label: t('dashboard.customer.points'), value: (currentUser as any).points || 120 },
            ].map((stat, index) => (
              <div key={index} className="bg-white border rounded-xl p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-orange-600">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-10">
              {/* Thú cưng */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Heart className="w-7 h-7 text-orange-600" />
                    {t('dashboard.customer.myPets')}
                  </h2>
                  <Link href="/customer/pets">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      {t('dashboard.customer.addPetPlus')}
                    </Button>
                  </Link>
                </div>

                {pets.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {pets.map((pet) => (
                      <div key={pet.id} className="border rounded-xl p-6 hover:shadow-md transition">
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-3">
                            {pet.type === 'dog' && '🐶'}
                            {pet.type === 'cat' && '🐱'}
                          </div>
                          <h3 className="font-semibold text-xl">
                            {pet.name || pet.tenThuCung || t('dashboard.customer.pets')}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p><strong>{t('dashboard.customer.breed')}</strong> {pet.breed || pet.giong}</p>
                          <p><strong>{t('dashboard.customer.age')}</strong> {t('dashboard.customer.ageValue', { age: pet.age || pet.tuoi })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-4">{t('dashboard.customer.noPets')}</p>
                    <Link href="/customer/pets">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        {t('dashboard.customer.addPet')}
                      </Button>
                    </Link>
                  </div>
                )}
              </section>

              {/* Đơn hàng gần đây */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Package className="w-7 h-7 text-orange-600" />
                    {t('dashboard.customer.recentOrders')}
                  </h2>
                  <Link href="/customer/orders">
                    <Button variant="outline" size="sm">{t('common.actions.viewAll')}</Button>
                  </Link>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="border rounded-xl p-5 hover:shadow transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">{t('dashboard.orders.order')} #{order.maDH || order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.ngayTao || order.createdAt || '').toLocaleDateString(t('common.currency.locale'))}
                            </p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.trangThai)}`}>
                            {getStatusLabel(order.trangThai)}
                          </span>
                        </div>
                        <div className="mt-4 flex justify-between items-center border-t pt-4">
                          <p className="text-gray-600">{t('dashboard.orders.total')}</p>
                          <p className="text-xl font-bold text-orange-600">
                            {((order.tongTien || 0) / 1000).toFixed(0)}K ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">{t('dashboard.orders.emptyTitle')}</p>
                    <Link href="/products" className="mt-4 inline-block">
                      <Button className="bg-orange-600 hover:bg-orange-700">{t('common.actions.shopNow')}</Button>
                    </Link>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 border rounded-2xl p-6 sticky top-6">
                <h3 className="font-semibold text-lg mb-5">{t('dashboard.customer.accountInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">{t('common.fields.fullName')}</p>
                    <p className="font-medium">{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{t('common.fields.phone')}</p>
                    <p className="font-medium">{(currentUser as any).phone || t('common.fallbacks.notUpdated')}</p>
                  </div>
                </div>

                <Link href="/customer/settings" className="block mt-8">
                  <Button variant="outline" className="w-full">
                    {t('dashboard.customer.editInfo')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
