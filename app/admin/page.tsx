'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { BarChart3, Users, ShoppingBag, Calendar } from 'lucide-react';
import { getOrders, getServiceBookings, getProducts, getServices } from '@/lib/storage';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/userService';
import { donHangService } from '@/services/donHangService';
import { lichHenService } from '@/services/lichHenService';
import { sanPhamService } from '@/services/sanPhamService';
import { viTriSanPhamService } from '@/services/viTriSanPhamService';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viTriStats, setViTriStats] = useState([]);

  const [userSummary, setUserSummary] = useState({
    tongSoUser: 0,
    soUserActive: 0,
    soUserInactive: 0,
    soNhanVien: 0,
    soKhachHang: 0,
    soAdmin: 0,
    soStaff: 0,
    soKTV: 0,
    soCustomer: 0,
  });

  const [orderSummary, setOrderSummary] = useState({
  tongSoDonHang: 0,
  soPending: 0,
  soDone: 0,
  soCancel: 0,
  soConfirmed: 0,
  soInProgress: 0,
  doanhThuThang: 0,
  tongDoanhThu: 0,
});

const [bookingSummary, setBookingSummary] = useState({
  tongSoLichHen: 0,
  soPending: 0,
  soConfirmed: 0,
  soInProgress: 0,
  soDone: 0,
  soCancel: 0,
});

const [tongDoanhThuDichVu, setTongDoanhThuDichVu] = useState(0);

  const loadUserSummary = async () => {
    try {
      const res = await userService.getUserSummary();

      if (res.data?.data) {
        setUserSummary(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi lấy thống kê user:', error);
    }
  };

  const loadOrderSummary = async () => {
  try {
    const res = await donHangService.getDonHangSummary();

    if (res.data?.data) {
      setOrderSummary(res.data.data);
    }
  } catch (error) {
    console.error('Lỗi lấy thống kê đơn hàng:', error);
  }
};

const loadBookingSummary = async () => {
  try {
    const res = await lichHenService.getSummary();

    if (res.data?.data) {
      setBookingSummary(res.data.data);
    }
  } catch (error) {
    console.error('Lỗi lấy thống kê lịch hẹn:', error);
  }
};

const loadTongDoanhThuDichVu = async () => {
  try {
    const res = await lichHenService.getTongDoanhThu();

    if (res.data?.data != null) {
      setTongDoanhThuDichVu(res.data.data);
    }
  } catch (error) {
    console.error('Lỗi lấy doanh thu dịch vụ:', error);
  }
};

const loadViTriStats = async () => {
  try {
    // lấy danh sách kệ
    const res = await viTriSanPhamService.getAllViTri();

    const viTriList = res.data || [];

    // lấy số lượng từng kệ
    const data = await Promise.all(
      viTriList.map(async (item : any) => {
        const countRes = await sanPhamService.countByViTri(item.maViTri);

        return {
          maViTri: item.maViTri,
          viTri: item.viTri,
          count: countRes.data.data,
        };
      })
    );

    setViTriStats(data);
  } catch (err) {
    console.error("Lỗi lấy thống kê kệ:", err);
  }
};

const [productSummary, setProductSummary] = useState({
  tongSoSanPham: 0,
  soHetHang: 0,
  soSapHetHang: 0,
  tongGiaTriKho: 0,
});

const loadProductSummary = async () => {
  try {
    const res = await sanPhamService.getSanPhamSummary();

    if (res.data?.data) {
      setProductSummary(res.data.data);
    }
  } catch (error) {
    console.error('Lỗi lấy thống kê sản phẩm:', error);
  }
};

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    loadUserSummary();
    loadOrderSummary();
     loadBookingSummary();
     loadTongDoanhThuDichVu();
      loadProductSummary();
      loadViTriStats();
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>{t('common.loading.default')}</div>;
  }

  const orders = getOrders();
  const bookings = getServiceBookings();
  const services = getServices();

  const stats = [
    {
      icon: '👥',
      route: '/admin/user',
      label: t('dashboard.admin.totalUsers'),
      value:  userSummary.tongSoUser,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: '🛍️',
      route: '/admin/donhang',
      label: t('dashboard.admin.totalOrders'),
      value: orderSummary.tongSoDonHang,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: '📅',
      label: t('dashboard.admin.totalBookings'),
      route: '/admin/booking',
      value: bookingSummary.tongSoLichHen,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: '📦',
      route: '/admin/sanpham',
      label: t('dashboard.admin.products'),
      value: productSummary.tongSoSanPham,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const totalRevenue = orderSummary.tongDoanhThu;
  const servicesRevenue = tongDoanhThuDichVu;
  const pendingOrders = orderSummary.soPending + orderSummary.soConfirmed + orderSummary.soInProgress;
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
                {totalRevenue.toLocaleString('vi-VN')}VNĐ
              </p>
              <p className="text-sm text-gray-600 mt-2">{t('dashboard.fromOrders', { count: orders.length })}</p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.admin.serviceRevenue')}</h2>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {servicesRevenue.toLocaleString('vi-VN')}VNĐ
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
                  <span className="font-semibold">{userSummary.soAdmin}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('dashboard.admin.staff')}</span>
                  <span className="font-semibold">{userSummary.soStaff}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">KTV</span>
                  <span className="font-semibold">{userSummary.soKTV}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-600">{t('dashboard.admin.customers')}</span>
                  <span className="font-semibold">{userSummary.soCustomer}</span>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"  onClick={() => router.push('/admin/user')}>
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
                <div className="space-y-2 mb-6">
                  {viTriStats.map((item : any) => (
                    <div
                      key={item.maViTri}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.viTri}
                      </span>

                      <span className="font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push('/admin/sanpham')}>
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
                value: pendingOrders,
                color: 'text-yellow-600',
              },
              {
                title: t('dashboard.admin.pendingServices'),
                value: bookingSummary.soPending,
                color: 'text-blue-600',
              },
              {
                title: t('dashboard.admin.outOfStock'),
                 value: productSummary.soHetHang,
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
