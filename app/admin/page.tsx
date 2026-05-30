'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { BarChart3, Users, ShoppingBag, Calendar } from 'lucide-react';
import { getOrders, getServiceBookings, getAllUsers, getProducts, getServices } from '@/lib/storage';
import { getAllUsers as getAllUsersAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>{t('common.loading.default')}</div>;
  }

  const orders = getOrders();
  const bookings = getServiceBookings();
  const users = getAllUsersAuth();
  const products = getProducts();
  const services = getServices();

  const stats = [
    {
      icon: '👥',
      label: t('dashboard.admin.totalUsers'),
      value: users.length,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: '🛍️',
      label: t('dashboard.admin.totalOrders'),
      value: orders.length,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: '📅',
      label: t('dashboard.admin.totalBookings'),
      route: '/admin/booking',
      value: bookings.length,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: '📦',
      label: t('dashboard.admin.products'),
      value: products.length,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const servicesRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">{t('dashboard.admin.subtitle')}</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if ('route' in stat && stat.route) {
                      router.push(stat.route);
                    }
                  }}
                  className={`
                    ${stat.color}
                    rounded-lg
                    p-6
                    transition
                    hover:scale-105
                    cursor-pointer
                    hover:shadow-lg
                  `}
                >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.admin.salesRevenue')}</h2>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {(totalRevenue / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600 mt-2">{t('dashboard.fromOrders', { count: orders.length })}</p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.admin.serviceRevenue')}</h2>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {(servicesRevenue / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600 mt-2">{t('dashboard.fromServices', { count: bookings.length })}</p>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Users Management */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.admin.userManagement')}</h2>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Admin</span>
                  <span className="font-semibold">{users.filter(u => u.role === 'admin').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('dashboard.admin.staff')}</span>
                  <span className="font-semibold">{users.filter(u => u.role === 'staff').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">KTV</span>
                  <span className="font-semibold">{users.filter(u => u.role === 'ktv').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-600">{t('dashboard.admin.customers')}</span>
                  <span className="font-semibold">{users.filter(u => u.role === 'customer').length}</span>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {t('dashboard.admin.userManagement')}
              </Button>
            </div>

            {/* Products Management */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.admin.productManagement')}</h2>
              </div>

              <div className="space-y-2 mb-6">
                {[...new Set(products.map(p => p.category))].map((category) => {
                  const count = products.filter(p => p.category === category).length;
                  return (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                {t('dashboard.admin.productManagement')}
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="mt-6 bg-white border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.admin.serviceManagement')}</h2>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Grooming', count: services.filter(s => s.category === 'grooming').length },
                { label: 'Spa', count: services.filter(s => s.category === 'spa').length },
                { label: t('dashboard.admin.hotel'), count: services.filter(s => s.category === 'hotel').length },
                { label: 'Healthcare', count: services.filter(s => s.category === 'healthcare').length },
                { label: 'Training', count: services.filter(s => s.category === 'training').length },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">{item.label}</p>
                  <p className="text-2xl font-bold text-orange-600">{item.count}</p>
                </div>
              ))}
            </div>

            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              {t('dashboard.admin.serviceManagement')}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {
                title: t('dashboard.admin.pendingOrders'),
                value: orders.filter(o => o.status === 'pending').length,
                color: 'text-yellow-600',
              },
              {
                title: t('dashboard.admin.pendingServices'),
                value: bookings.filter(b => b.status === 'pending').length,
                color: 'text-blue-600',
              },
              {
                title: t('dashboard.admin.outOfStock'),
                value: products.filter(p => p.stock === 0).length,
                color: 'text-red-600',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white border rounded-lg p-6 text-center">
                <p className="text-gray-600 text-sm mb-2">{item.title}</p>
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
