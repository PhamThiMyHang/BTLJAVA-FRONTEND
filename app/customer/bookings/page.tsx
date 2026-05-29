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
import { Eye } from 'lucide-react';

export default function BookingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
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
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      'in-progress': 'Đang thực hiện',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
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
                <h1 className="text-3xl font-bold text-gray-900">Dịch vụ đã đặt</h1>
                <p className="text-gray-600 mt-2">Quản lý lịch đặt dịch vụ</p>
              </div>
              <Link href="/customer">
                <Button variant="outline">Quay lại Dashboard</Button>
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
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Dịch vụ</p>
                        <p className="text-lg font-bold">{service?.name}</p>
                        <p className="text-2xl mt-1">{getCategoryEmoji(service?.category || 'training')}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Thú cưng</p>
                        <p className="font-semibold text-gray-900">{pet?.name}</p>
                        <p className="text-sm text-gray-600">({pet?.breed})</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Lịch</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-sm text-gray-600">{booking.time}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Giá / Trạng thái</p>
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
                          Chi tiết
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có dịch vụ nào được đặt</h2>
              <p className="text-gray-600 mb-6">Hãy khám phá các dịch vụ mà chúng tôi cung cấp</p>
              <Link href="/services">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Xem dịch vụ
                </Button>
              </Link>
            </div>
          )}

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Chi tiết đặt dịch vụ #{selectedBooking.id}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Dịch vụ</p>
                      <p className="font-semibold text-gray-900">
                        {getServiceById(selectedBooking.serviceId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Thú cưng</p>
                      <p className="font-semibold text-gray-900">
                        {getPetById(selectedBooking.petId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Ngày / Giờ</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedBooking.date).toLocaleDateString('vi-VN')} -{' '}
                        {selectedBooking.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Trạng thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusLabel(selectedBooking.status)}
                      </span>
                    </div>
                  </div>

                  {selectedBooking.notes && (
                    <div className="border-t pt-4">
                      <p className="text-gray-600 text-sm">Ghi chú</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedBooking.notes}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Giá dịch vụ:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {(selectedBooking.price / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  {selectedBooking.assignedKTV && (
                    <div className="border-t pt-4">
                      <p className="text-gray-600 text-sm">KTV phụ trách</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.assignedKTV}</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedBooking(null)}
                >
                  Đóng
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
