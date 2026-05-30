'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowUpDown, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { useTranslation } from 'react-i18next';

type Booking = {
  id: number;
  customerName: string;
  petName: string;
  serviceName: string;
  staffName: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

type SortField =
  | 'customerName'
  | 'petName'
  | 'staffName'
  | 'bookingTime';

export default function BookingManagementPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');

  const [sortField, setSortField] =
    useState<SortField>('bookingTime');

  const [sortOrder, setSortOrder] =
    useState<'asc' | 'desc'>('desc');

  // Kiểm tra quyền admin
  useEffect(() => {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  // Fetch API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/bookings'
        );

        if (!response.ok) {
          throw new Error(t('dashboard.adminBooking.fetchError'));
        }

        const data = await response.json();

        setBookings(data);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu lịch hẹn:', error);
      }
    };

    fetchBookings();
  }, []);

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter + Sort
  const filteredBookings = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      const keyword = search.toLowerCase();

      return (
        booking.customerName.toLowerCase().includes(keyword) ||
        booking.petName.toLowerCase().includes(keyword) ||
        booking.staffName.toLowerCase().includes(keyword) ||
        booking.serviceName.toLowerCase().includes(keyword)
      );
    });

    filtered.sort((a, b) => {
      if (sortField === 'bookingTime') {
        const timeA = new Date(a.bookingTime).getTime();
        const timeB = new Date(b.bookingTime).getTime();

        return sortOrder === 'asc'
          ? timeA - timeB
          : timeB - timeA;
      }

      const valueA = a[sortField].toLowerCase();
      const valueB = b[sortField].toLowerCase();

      return sortOrder === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    return filtered;
  }, [bookings, search, sortField, sortOrder]);

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString(t('common.currency.locale'), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';

      case 'confirmed':
        return 'bg-blue-100 text-blue-700';

      case 'completed':
        return 'bg-green-100 text-green-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('common.status.pending');

      case 'confirmed':
        return t('common.status.confirmed');

      case 'completed':
        return t('common.status.completed');

      case 'cancelled':
        return t('common.status.cancelled');

      default:
        return status;
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('common.loading.default')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.adminBooking.title')}
            </h1>

            <p className="text-gray-600 mt-2">
              {t('dashboard.adminBooking.subtitle')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search */}
          <div className="bg-white border rounded-xl p-5 mb-6">
            <div className="relative max-w-md">
            
              <input
                type="text"
                placeholder={t('dashboard.adminBooking.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr className="text-sm text-gray-700">
                    <th className="px-5 py-4 text-left font-semibold">
                      STT
                    </th>

                    {/* Customer */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('customerName')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('common.fields.customer')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Pet */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('petName')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('dashboard.adminBooking.petName')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Service */}
                    <th className="px-5 py-4 text-left font-semibold">
                      {t('common.fields.service')}
                    </th>

                    {/* Staff */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('staffName')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('dashboard.adminBooking.assignedStaff')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Time */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('bookingTime')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('dashboard.adminBooking.time')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Status */}
                    <th className="px-5 py-4 text-center font-semibold">
                      {t('common.fields.status')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <tr
                        key={booking.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-4 font-medium">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          {booking.customerName}
                        </td>

                        <td className="px-5 py-4">
                          {booking.petName}
                        </td>

                        <td className="px-5 py-4">
                          {booking.serviceName}
                        </td>

                        <td className="px-5 py-4">
                          {booking.staffName}
                        </td>

                        <td className="px-5 py-4">
                          {formatDateTime(
                            booking.bookingTime
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                              booking.status
                            )}`}
                          >
                            {getStatusText(
                              booking.status
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-gray-500"
                      >
                        {t('dashboard.adminBooking.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
