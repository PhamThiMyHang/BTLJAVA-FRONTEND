'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { Calendar, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { getBookingsByKTV, getServiceBookings, getServiceById, getPetById, getBookingById, updateBooking } from '@/lib/storage';
import { useTranslation } from 'react-i18next';

export default function KTVDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'ktv') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setBookings(getBookingsByKTV(user.id));
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>{t('common.loading.default')}</div>;
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const inProgressBookings = bookings.filter(b => b.status === 'in-progress').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('common.status.pending'),
      confirmed: t('common.status.confirmed'),
      'in-progress': t('common.status.inProgress'),
      completed: t('common.status.completed'),
      cancelled: t('common.status.cancelled'),
    };
    return labels[status] || status;
  };

  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    updateBooking(bookingId, { status: newStatus as any });
    setBookings(getBookingsByKTV(currentUser!.id));
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">KTV Dashboard</h1>
            <p className="text-gray-600 mt-2">{t('dashboard.ktv.subtitle')}</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Calendar className="w-6 h-6" />, label: t('dashboard.ktv.totalServices'), value: totalBookings, color: 'bg-blue-100 text-blue-600' },
              { icon: <Clock className="w-6 h-6" />, label: t('common.status.pending'), value: pendingBookings, color: 'bg-yellow-100 text-yellow-600' },
              { icon: <CheckCircle className="w-6 h-6" />, label: t('common.status.inProgress'), value: inProgressBookings, color: 'bg-purple-100 text-purple-600' },
              { icon: <DollarSign className="w-6 h-6" />, label: t('common.status.completed'), value: completedBookings, color: 'bg-green-100 text-green-600' },
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
              {(totalRevenue / 1000).toFixed(0)}K VND
            </p>
            <p className="text-gray-600 mt-2">{t('dashboard.fromServices', { count: totalBookings })}</p>
          </div>

          {/* Bookings Management */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.ktv.serviceList')}</h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-sm">
                <option>{t('common.status.all')}</option>
                <option>{t('common.status.pending')}</option>
                <option>{t('common.status.confirmed')}</option>
                <option>{t('common.status.inProgress')}</option>
                <option>{t('common.status.completed')}</option>
              </select>
            </div>

            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking: any) => {
                  const service = getServiceById(booking.serviceId);
                  const pet = getPetById(booking.petId);
                  return (
                    <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="grid md:grid-cols-5 gap-4 items-start">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">{t('common.fields.service')}</p>
                          <p className="font-semibold text-gray-900">{service?.name}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">{t('common.fields.pet')}</p>
                          <p className="font-semibold text-gray-900">{pet?.name}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">{t('common.fields.schedule')}</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(booking.date).toLocaleDateString(t('common.currency.locale'))}
                          </p>
                          <p className="text-sm text-gray-600">{booking.time}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">{t('common.fields.price')}</p>
                          <p className="font-bold text-orange-600">
                            {(booking.price / 1000).toFixed(0)}K
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            {t('common.actions.details')}
                          </Button>
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <strong>{t('common.fields.notes')}:</strong> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t('dashboard.ktv.empty')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.ktv.updateStatus')}</h3>
                <p className="text-gray-600 mb-2">ID: #{selectedBooking.id}</p>
                <p className="text-gray-600 mb-6">{getServiceById(selectedBooking.serviceId)?.name}</p>

                <div className="space-y-2 mb-6">
                  {['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedBooking.id, status)}
                      className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        selectedBooking.status === status
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
                  onClick={() => setSelectedBooking(null)}
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
