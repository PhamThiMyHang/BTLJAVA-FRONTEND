'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, CheckCircle2, Loader2, AlertCircle, X, User } from 'lucide-react';
import Link from 'next/link';
import { dichVuService } from '@/services/dichVuService';
import { lichHenService } from '@/services/lichHenService';
import { nhanVienService } from '@/services/nhanVienService';
import { getCurrentUser } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { ServiceImage } from '@/components/ServiceImage';

const formatPrice = (gia: number | string, locale: string): string => {
  const num = Number(gia || 0);
  if (num === 0) return '0đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getMaxDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

interface NhanVienOption {
  maNV: string;
  tenNV: string;
  chucVu?: string;
}

export default function ServiceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const maDV = params?.id as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedNV, setSelectedNV] = useState('');
  const [petName, setPetName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [formError, setFormError] = useState('');

  // Danh sách nhân viên
  const [nhanVienList, setNhanVienList] = useState<NhanVienOption[]>([]);
  const [loadingNV, setLoadingNV] = useState(false);

  useEffect(() => {
    if (!maDV) return;
    const fetchService = async () => {
      try {
        setLoading(true);
        const data = await dichVuService.getDichVuById(maDV);
        const serviceData = data.data || data;
        setService(serviceData);
      } catch (err: any) {
        setError('Không tìm thấy dịch vụ này.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [maDV]);

  // Khoá scroll body khi modal mở
  useEffect(() => {
    if (showBooking) {
      document.body.style.overflow = 'hidden';
      // Tải danh sách nhân viên
      fetchNhanVien();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showBooking]);

  const fetchNhanVien = async () => {
    try {
      setLoadingNV(true);
      const res = await nhanVienService.getAllNhanVien();
      // Chuẩn hóa dữ liệu: có thể là array hoặc {data: [...]}
      let list: any[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res.data?.content && Array.isArray(res.data.content)) {
        list = res.data.content;
      }
      setNhanVienList(list.map((nv: any) => ({
        maNV: String(nv.maNV),
        tenNV: nv.tenNV || nv.hoTen || `Nhân viên ${nv.maNV}`,
        chucVu: nv.chucVu || nv.viTri || '',
      })));
    } catch (err) {
      console.error('Không tải được danh sách nhân viên:', err);
      setNhanVienList([]);
    } finally {
      setLoadingNV(false);
    }
  };

  const handleOpenBooking = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đặt lịch dịch vụ.');
      router.push('/login');
      return;
    }
    setShowBooking(true);
    setBookingSuccess(false);
    setFormError('');
  };

  const handleBookingSubmit = async () => {
    const currentUser = getCurrentUser() as any;
    if (!currentUser) { router.push('/login'); return; }

    if (!selectedDate) { setFormError('Vui lòng chọn ngày đặt lịch.'); return; }
    if (!selectedTime) { setFormError('Vui lòng chọn giờ.'); return; }
    if (!selectedNV) { setFormError('Vui lòng chọn nhân viên phụ trách.'); return; }

    setFormError('');
    setSubmitting(true);

    try {
      const thoiGian = `${selectedDate}T${selectedTime}:00`;
      const payload = {
        maKH: String(currentUser.userID || currentUser.maKH || currentUser.id),
        maPet: '',
        maNV: selectedNV,
        maDV: service.maDV,
        thoiGian,
        trangThai: 'CHO_XAC_NHAN',
      };

      const res = await lichHenService.createLichHen(payload);
      // Backend dùng BaseController.resCreated → {status, message, data: LichHenDTO}
      const raw = res?.data as any;
      const resData = raw?.data || raw;
      const newId = resData?.maLich || ('LH' + Date.now());

      setBookingId(newId);
      setBookingSuccess(true);
      window.dispatchEvent(new Event('bookingUpdate'));
    } catch (e: any) {
      setFormError('Đặt lịch thất bại: ' + (e?.response?.data?.message || 'Lỗi không xác định. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowBooking(false);
    setBookingSuccess(false);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedNV('');
    setPetName('');
    setNote('');
    setFormError('');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600 text-2xl">{error || 'Không tìm thấy dịch vụ.'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">Trang chủ</Link> /
            <Link href="/services" className="hover:text-orange-600">Dịch vụ</Link> /
            <span className="text-gray-900 font-medium">{service.tenDV}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100">
                <ServiceImage service={service} />
              </div>
            </div>

            <div className="space-y-8">
              <span className="inline-block px-5 py-2 bg-orange-100 text-orange-700 font-semibold rounded-full">
                {service.category?.toUpperCase() || 'DỊCH VỤ'}
              </span>

              <h1 className="text-5xl font-bold text-gray-900">{service.tenDV}</h1>

              <div className="text-5xl font-bold text-orange-600">
                {formatPrice(service.gia, 'vi-VN')}
              </div>

              <div className="text-gray-600 text-lg leading-relaxed">{service.moTa}</div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Lịch làm việc</p>
                    <p className="font-semibold text-sm">Thứ 2 – Chủ nhật</p>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Giờ mở cửa</p>
                    <p className="font-semibold text-sm">08:00 – 17:30</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOpenBooking}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl py-7 rounded-2xl flex items-center justify-center gap-3"
              >
                <Calendar className="w-6 h-6" />
                Đặt lịch ngay
              </Button>

              <Link href="/services">
                <Button variant="outline" className="w-full py-6 text-lg">
                  <ArrowLeft className="mr-2" /> Xem thêm dịch vụ khác
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── BOOKING MODAL ── */}
      {showBooking && (
        <>
          {/* Overlay – click để đóng */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
            <div
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-orange-600 px-6 py-5 flex items-center justify-between rounded-t-3xl sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">Đặt lịch dịch vụ</h2>
                  <p className="text-orange-100 text-sm mt-0.5">{service.tenDV}</p>
                </div>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nội dung */}
              <div className="p-6">
                {bookingSuccess ? (
                  /* ─ SUCCESS ─ */
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Đặt lịch thành công! 🎉</h3>
                    <p className="text-gray-500 text-sm mb-1">Mã lịch hẹn của bạn</p>
                    <p className="text-xl font-bold text-orange-600 mb-4">{bookingId}</p>
                    <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dịch vụ</span>
                        <span className="font-semibold">{service.tenDV}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nhân viên</span>
                        <span className="font-semibold">
                          {nhanVienList.find(nv => nv.maNV === selectedNV)?.tenNV || selectedNV}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ngày</span>
                        <span className="font-semibold">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giờ</span>
                        <span className="font-semibold">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chi phí</span>
                        <span className="font-bold text-orange-600">{formatPrice(service.gia, 'vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trạng thái</span>
                        <span className="text-yellow-600 font-semibold">Chờ xác nhận</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">
                      Nhân viên sẽ liên hệ xác nhận lịch hẹn trong vòng 30 phút.
                    </p>
                    <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-2">
                      🛒 Lịch hẹn đã được thêm vào giỏ hàng. Bạn có thể thanh toán tại giỏ hàng.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                        Đóng
                      </Button>
                      <Link href="/cart" className="flex-1">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          Đến giỏ hàng 🛒
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ─ FORM ─ */
                  <div className="space-y-5">

                    {/* Chọn nhân viên */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chọn nhân viên phụ trách <span className="text-red-500">*</span>
                      </label>
                      {loadingNV ? (
                        <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh sách nhân viên...
                        </div>
                      ) : nhanVienList.length === 0 ? (
                        <p className="text-sm text-red-500 py-2">Không tải được danh sách nhân viên. Vui lòng thử lại.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {nhanVienList.map(nv => (
                            <button
                              key={nv.maNV}
                              type="button"
                              onClick={() => setSelectedNV(nv.maNV)}
                              className={`p-3 rounded-xl text-sm font-medium border text-left transition-all ${
                                selectedNV === nv.maNV
                                  ? 'border-2 border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <User className={`w-3.5 h-3.5 flex-shrink-0 ${selectedNV === nv.maNV ? 'text-orange-500' : 'text-gray-400'}`} />
                                <div>
                                  <div>{nv.tenNV}</div>
                                  {nv.chucVu && (
                                    <div className="text-xs text-gray-400 font-normal">{nv.chucVu}</div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chọn ngày */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chọn ngày <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={getMinDate()}
                        max={getMaxDate()}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    {/* Chọn giờ */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chọn giờ <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-1 rounded-xl text-sm font-medium border transition-all ${
                              selectedTime === slot
                                ? 'bg-orange-600 border-orange-600 text-white'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tên thú cưng */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên thú cưng <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                      </label>
                      <input
                        type="text"
                        value={petName}
                        onChange={e => setPetName(e.target.value)}
                        placeholder="VD: Mèo Bông, Chó Cún..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    {/* Ghi chú */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                      </label>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={2}
                        placeholder="Yêu cầu đặc biệt, tình trạng thú cưng..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>

                    {/* Tóm tắt giá */}
                    <div className="bg-orange-50 rounded-2xl p-4 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Chi phí dịch vụ</span>
                      <span className="text-xl font-bold text-orange-600">{formatPrice(service.gia, 'vi-VN')}</span>
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {formError}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                        Hủy
                      </Button>
                      <Button
                        onClick={handleBookingSubmit}
                        disabled={submitting || loadingNV}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      >
                        {submitting
                          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang xử lý...</>
                          : '✅ Xác nhận đặt lịch'
                        }
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
