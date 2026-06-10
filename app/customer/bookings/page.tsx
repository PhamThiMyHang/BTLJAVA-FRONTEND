'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { getBookingsByCustomer, getServiceById, getPetById } from '@/lib/storage';
import { User } from '@/lib/mock-data';
import Link from 'next/link';
import { Eye, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser() as any;
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setBookings(getBookingsByCustomer(user.id));
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>Loading...</div>;
  }

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

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      grooming: '✂️',
      spa: '🛁',
      hotel: '🏨',
      healthcare: '💊',
      training: '🎓',
    };
    return emojis[category] || '🐾';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.bookings.title')}</h1>
                <p className="text-gray-600 mt-2">{t('dashboard.bookings.subtitle')}</p>
              </div>
              <Link href="/customer">
                <Button variant="outline" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" />Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const service = getServiceById(booking.serviceId);
                const pet = getPetById(booking.petId);
                return (
                  <div key={booking.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
                    <div className="grid md:grid-cols-5 gap-4 items-start">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('common.fields.service')}</p>
                        <p className="text-lg font-bold">{service?.name}</p>
                        <p className="text-2xl mt-1">{getCategoryEmoji(service?.category || 'training')}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('common.fields.pet')}</p>
                        <p className="font-semibold text-gray-900">{pet?.name}</p>
                        <p className="text-sm text-gray-600">({pet?.breed})</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('common.fields.schedule')}</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-sm text-gray-600">{booking.time}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('dashboard.bookings.priceStatus')}</p>
                        <p className="text-xl font-bold text-orange-600 mb-2">
                          {(booking.price / 1000).toFixed(0)}K
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBooking(booking)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {t('common.actions.details')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.bookings.emptyTitle')}</h2>
              <p className="text-gray-600 mb-6">{t('dashboard.bookings.emptyDescription')}</p>
              <Link href="/services">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  {t('dashboard.bookings.viewServices')}
                </Button>
              </Link>
            </div>
          )}

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('dashboard.bookings.detailTitle', { id: selectedBooking.id })}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">{t('common.fields.service')}</p>
                      <p className="font-semibold text-gray-900">
                        {getServiceById(selectedBooking.serviceId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{t('common.fields.pet')}</p>
                      <p className="font-semibold text-gray-900">
                        {getPetById(selectedBooking.petId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{t('dashboard.bookings.dateTime')}</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedBooking.date).toLocaleDateString('vi-VN')} -{' '}
                        {selectedBooking.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{t('common.fields.status')}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusLabel(selectedBooking.status)}
                      </span>
                    </div>
                  </div>

                  {selectedBooking.notes && (
                    <div className="border-t pt-4">
                      <p className="text-gray-600 text-sm">{t('common.fields.notes')}</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedBooking.notes}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{t('dashboard.bookings.servicePrice')}</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {(selectedBooking.price / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  {selectedBooking.assignedKTV && (
                    <div className="border-t pt-4">
                      <p className="text-gray-600 text-sm">{t('dashboard.bookings.assignedKtv')}</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.assignedKTV}</p>
                    </div>
                  )}
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
