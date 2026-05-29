'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { gioHangService } from '@/services/gioHangService'; 
import Link from 'next/link';
import { Trash2, ArrowLeft } from 'lucide-react';

// Khai báo Interface khớp 100% với cấu trúc thuộc tính của GioHangDTO bên Spring Boot
interface GioHangDTO {
  maGioHang: string;
  maSP: string;
  tenSP: string;        // Lấy tên cụ thể từ bảng Sản phẩm thông qua DTO
  soLuong: number;
  donGia: number;       // Giá bán thực tế
  thanhTien: number;    // = soLuong * donGia được tính toán từ Backend
  maUser: string;
  tenUser: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<GioHangDTO[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Mặc định là COD cho tiện
  const [address, setAddress] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Kiểm tra tài khoản đăng nhập khi trang được tải lên
  useEffect(() => {
    const user = getCurrentUser()as any;
    
    // Đảm bảo lấy đúng trường userID từ dữ liệu phiên đăng nhập của hệ thống
    if (!user || !user.userID)  {
      router.push('/login');
      return;
    }

    const currentUserId = String(user.userID);
    setUserId(currentUserId);
    fetchCartData(currentUserId);
  }, []);

  // Hàm gọi API đồng bộ dữ liệu danh sách sản phẩm và tổng tiền tài khoản
  const fetchCartData = async (maUser: string) => {
    try {
      setLoading(true);
      
      // Gọi API số 4: /api/v1/gio-hang/user/{maUser}
      const response = await gioHangService.getByMaUser(maUser);
      // Kiểm tra cấu trúc dữ liệu trả về từ Controller (bọc qua Base hoặc mảng trực tiếp)
      const cartItems: GioHangDTO[] = response.data || response || [];
      setCart(cartItems);

      // Nếu giỏ hàng có sản phẩm, gọi API số 5 lấy tổng tiền từ DB thông qua maGioHang dạng GH_maUser
      if (cartItems.length > 0 && cartItems[0].maGioHang) {
        const totalResponse = await gioHangService.getTongTien(cartItems[0].maGioHang);
        const total = totalResponse.data !== undefined ? totalResponse.data : totalResponse;
        setCartTotal(Number(total) || 0);
      } else {
        setCartTotal(0);
      }

    } catch (error) {
      console.error("Lỗi khi kết nối API giỏ hàng:", error);
      setCart([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý xóa sản phẩm bằng API số 6 (Sử dụng Query Params: maGioHang và maSP)
  const handleRemoveItem = async (maGioHang: string, maSP: string) => {
    if (!userId) return;
    try {
      // Gửi request DELETE tới endpoint /api/v1/gio-hang/detail?maGioHang=...&maSP=...
      await gioHangService.deleteItem(maGioHang, maSP);
      
      // Tải lại dữ liệu mới nhất từ Database sau khi xóa thành công
      await fetchCartData(userId);
      
      // Kích hoạt sự kiện toàn cục để Header tự cập nhật lại số lượng giỏ hàng trên Badge
      window.dispatchEvent(new Event('cartUpdate'));
    } catch (error) {
      console.error("Lỗi khi thực hiện xóa sản phẩm:", error);
      alert("Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại!");
    }
  };

  // 3. Tiến hành xử lý đặt hàng
  const handleCheckout = () => {
    if (!address) {
      alert('Vui lòng cung cấp địa chỉ nhận hàng!');
      return;
    }
    if (cart.length === 0) {
      alert('Giỏ hàng hiện tại đang trống!');
      return;
    }

    // Chuẩn bị cấu trúc gói hàng khớp với cấu trúc tiếp nhận của DonHangRequest bên Spring Boot
    const orderRequest = {
      maUser: userId,
      phuongThucThanhToan: paymentMethod,
      diaChiGiaoHang: address,
      tongTien: cartTotal + 30000, // Tổng giá trị đơn hàng cộng thêm phí vận chuyển cố định
      chiTietDonHang: cart.map(item => ({
        maSP: item.maSP,
        soLuong: item.soLuong,
        gia: item.donGia
      }))
    };

    console.log("Dữ liệu Payload gửi lên API Tạo đơn hàng:", orderRequest);
    // Tại đây bạn thực hiện gọi API POST đến /api/don-hang thông qua donHangService của bạn
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-700 font-medium text-lg">
        Đang tải thông tin sản phẩm từ giỏ hàng...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gray-50 py-8 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900">Giỏ hàng</h1>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {cart.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Vùng hiển thị danh sách các mặt hàng thực tế trong DB */}
              <div className="md:col-span-2">
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.maSP} className="bg-white border rounded-lg p-4 flex gap-4 items-center shadow-sm">
                      {/* Ảnh minh họa sản phẩm */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-3xl">
                        🐶
                      </div>

                      {/* Chi tiết thông tin sản phẩm cụ thể */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {item.tenSP}
                        </h3>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="text-orange-600 font-extrabold text-base">
                            {(item.donGia*1000).toFixed(0)}vnđ
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            Số lượng: x{item.soLuong}
                          </div>
                          <div className="font-bold text-gray-800 border-l pl-4">
                            Thành tiền: {(item.thanhTien*1000).toFixed(0)}vnđ
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động xóa sản phẩm */}
                      <button
                        onClick={() => handleRemoveItem(item.maGioHang, item.maSP)}
                        className="text-gray-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                        title="Xóa sản phẩm này"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <Link href="/products">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300">
                    <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng tìm thêm sản phẩm
                  </Button>
                </Link>
              </div>

              {/* Tóm tắt chi phí & Điền thông tin giao nhận hàng */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 border rounded-lg p-6 sticky top-20 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                  {!checkout ? (
                    <>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Tạm tính sản phẩm</span>
                          <span className="font-bold text-gray-900">
                            {(cartTotal * 1000).toFixed(0)}vnđ
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Phí giao hàng</span>
                          <span className="font-bold text-gray-900">30000vnđ</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-base">Tổng số tiền cần trả</span>
                          <span className="text-2xl font-black text-orange-600">
                            {((cartTotal + 30) * 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 transition shadow"
                        onClick={() => setCheckout(true)}
                      >
                        Tiến hành điền thông tin giao hàng
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhận hàng</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Hình thức thanh toán</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                          >
                            <option value="cash">Thanh toán khi nhận hàng (COD)</option>
                            <option value="bank_transfer">Chuyển khoản tài khoản ngân hàng</option>
                            <option value="credit_card">Thẻ tín dụng / Quốc tế</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 mb-2 transition shadow"
                        onClick={handleCheckout}
                      >
                        Xác nhận đặt đơn hàng ngay
                      </Button>

                      <Button 
                        variant="outline" 
                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-100" 
                        onClick={() => setCheckout(false)}
                      >
                        Quay lại kiểm tra sản phẩm
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="text-7xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">Bạn chưa thêm món đồ hay bé thú cưng nào vào giỏ. Hãy quay lại cửa hàng để lựa chọn nhé!</p>
              <Link href="/products">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2">
                  Bắt đầu mua sắm ngay
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}