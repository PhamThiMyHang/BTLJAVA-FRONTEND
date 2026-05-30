'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Package, Truck, DollarSign, TrendingUp } from 'lucide-react';
import { donHangService } from '@/services/donHangService';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { useTranslation } from 'react-i18next';

interface DonHang {
  id: string | number;
  maDH?: string;
  tenKhachHang?: string;
  customerId?: string;
  tongTien?: number;
  totalPrice?: number;
  trangThai?: string;
  status?: string;
  ngayTao?: string;
  createdAt?: string;
}

export default function StaffDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'staff') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await donHangService.searchDonHangs({
        size: 50,
        sort: 'ngayTao,desc'
      });
      setOrders(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading.data')}</p>
      </div>
    );
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => 
    o.trangThai === 'PENDING' || o.status === 'pending'
  ).length;
  const shippingOrders = orders.filter(o => 
    o.trangThai === 'SHIPPING' || o.status === 'shipping'
  ).length;
  const deliveredOrders = orders.filter(o => 
    o.trangThai === 'COMPLETED' || o.status === 'delivered'
  ).length;

  const totalRevenue = orders.reduce((sum, o) => 
    sum + (o.tongTien || o.totalPrice || 0), 0
  );

  const getStatusColor = (status?: string) => {
    const st = (status || '').toUpperCase();
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPING: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[st] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status?: string) => {
    const st = (status || '').toUpperCase();
    const labels: Record<string, string> = {
      PENDING: t('dashboard.staff.pending'),
      PROCESSING: t('common.status.processing'),
      SHIPPING: t('dashboard.staff.shipping'),
      COMPLETED: t('dashboard.staff.delivered'),
      CANCELLED: t('common.status.cancelled'),
      pending: t('dashboard.staff.pending'),
      confirmed: t('common.status.confirmed'),
      shipping: t('dashboard.staff.shipping'),
      delivered: t('dashboard.staff.delivered'),
      cancelled: t('common.status.cancelled'),
    };
    return labels[st] || status || t('common.status.unknown');
  };

  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    if (updating) return;
    
    try {
      setUpdating(true);
      
      // Gọi API cập nhật
      await donHangService.updateDonHang(orderId.toString(), {
        trangThai: newStatus.toUpperCase()
      });

      // Refresh danh sách
      await fetchOrders();
      setSelectedOrder(null);
      
      alert(t('dashboard.staff.updateSuccess'));
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert(t('dashboard.staff.updateError'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-2">{t('dashboard.staff.subtitle')}</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Package className="w-6 h-6" />, label: t('dashboard.staff.totalOrders'), value: totalOrders, color: 'bg-blue-100 text-blue-600' },
              { icon: <Truck className="w-6 h-6" />, label: t('dashboard.staff.pending'), value: pendingOrders, color: 'bg-yellow-100 text-yellow-600' },
              { icon: <DollarSign className="w-6 h-6" />, label: t('dashboard.staff.shipping'), value: shippingOrders, color: 'bg-purple-100 text-purple-600' },
              { icon: <TrendingUp className="w-6 h-6" />, label: t('dashboard.staff.delivered'), value: deliveredOrders, color: 'bg-green-100 text-green-600' },
            ].map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-lg p-6`}>
                <div className="mb-2">{stat.icon}</div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue */}
          <div className="bg-white border rounded-lg p-6 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.revenue')}</h2>
            </div>
            <p className="text-4xl font-bold text-orange-600">
              {Math.floor(totalRevenue / 1000).toLocaleString(t('common.currency.locale'))}K VND
            </p>
            <p className="text-gray-600 mt-2">{t('dashboard.fromOrders', { count: totalOrders })}</p>
          </div>

          {/* Orders Management */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.staff.orderList')}</h2>
              <Button onClick={fetchOrders} variant="outline" size="sm">
                {t('dashboard.staff.refresh')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dashboard.orders.order')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dashboard.staff.customer')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dashboard.orders.total')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('common.fields.status')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dashboard.staff.date')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dashboard.staff.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: DonHang) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-blue-600 font-semibold">
                        #{order.maDH || order.id}
                      </td>
                      <td className="py-3 px-4">
                        {order.tenKhachHang || order.customerId || t('dashboard.staff.walkIn')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-orange-600">
                        {((order.tongTien || order.totalPrice || 0) / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.trangThai || order.status)}`}>
                          {getStatusLabel(order.trangThai || order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.ngayTao || order.createdAt || Date.now()).toLocaleDateString(t('common.currency.locale'))}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          {t('dashboard.staff.update')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('dashboard.staff.updateStatus')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.orders.order')} #{selectedOrder.maDH || selectedOrder.id}
                </p>

                <div className="space-y-2 mb-6">
                  {['PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      disabled={updating}
                      className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition ${
                        (selectedOrder.trangThai || selectedOrder.status) === status
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedOrder(null)}
                  disabled={updating}
                >
                  {t('common.actions.close')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
