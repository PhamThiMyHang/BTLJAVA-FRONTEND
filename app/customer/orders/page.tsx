'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByCustomer, getProductById } from '@/lib/storage';
import { User } from '@/lib/mock-data';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setOrders(getOrdersByCustomer(user.id));
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipping: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang vận chuyển',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
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
                <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                <p className="text-gray-600 mt-2">Quản lý lịch sử mua hàng</p>
              </div>
              <Link href="/customer">
                <Button variant="outline">Quay lại Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
                  <div className="grid md:grid-cols-5 gap-4 items-start">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Đơn hàng</p>
                      <p className="text-lg font-bold text-blue-600">#{order.id}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ngày đặt</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng tiền</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(order.totalPrice / 1000).toFixed(0)}K
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên</p>
              <Link href="/products">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Bắt đầu mua sắm
                </Button>
              </Link>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Ngày đặt</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Trạng thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Phương thức thanh toán</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Địa chỉ giao</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.address}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900 mb-3">Sản phẩm đã đặt</p>
                    <div className="space-y-2">
                      {selectedOrder.products.map((item: any, index: number) => {
                        const product = getProductById(item.productId);
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-gray-900">{product?.name}</p>
                              <p className="text-gray-600">x{item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {(item.price * item.quantity / 1000).toFixed(0)}K
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-600">
                        {(selectedOrder.totalPrice / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedOrder(null)}
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                <p className="text-gray-600 mt-2">Quản lý lịch sử mua hàng</p>
              </div>
              <Link href="/customer">
                <Button variant="outline">Quay lại Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
                  <div className="grid md:grid-cols-5 gap-4 items-start">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Đơn hàng</p>
                      <p className="text-lg font-bold text-blue-600">#{order.id}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ngày đặt</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng tiền</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(order.totalPrice / 1000).toFixed(0)}K
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên</p>
              <Link href="/products">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Bắt đầu mua sắm
                </Button>
              </Link>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Ngày đặt</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Trạng thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Phương thức thanh toán</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Địa chỉ giao</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.address}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900 mb-3">Sản phẩm đã đặt</p>
                    <div className="space-y-2">
                      {selectedOrder.products.map((item: any, index: number) => {
                        const product = getProductById(item.productId);
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-gray-900">{product?.name}</p>
                              <p className="text-gray-600">x{item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {(item.price * item.quantity / 1000).toFixed(0)}K
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-600">
                        {(selectedOrder.totalPrice / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedOrder(null)}
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
