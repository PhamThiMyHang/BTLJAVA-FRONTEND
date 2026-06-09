'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { gioHangService } from '@/services/gioHangService';
import { donHangService } from '@/services/donHangService';
import { lichHenService } from '@/services/lichHenService';
import { dichVuService } from '@/services/dichVuService';
import Link from 'next/link';
import {
  Trash2, ArrowLeft, ShoppingCart, CreditCard, Banknote,
  QrCode, CheckCircle2, ChevronRight, Package, MapPin,
  AlertCircle, Loader2, X, Copy, Check, Calendar, Clock,
  Scissors, ChevronDown, ChevronUp, MinusCircle
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface GioHangDTO {
  maGioHang: string;
  maSP: string;
  tenSP: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  maUser: string;
  tenUser: string;
  hinhAnhSP?: string;
}

interface LichHenDTO {
  maLich: string;
  maKH: string;
  tenKH: string;
  maPet?: string;
  tenPet?: string;
  maNV?: string;
  tenNV?: string;
  maDV: string;
  tenDV: string;
  giaDV: number;
  gia?: number;          // alias backend có thể trả về
  giaDichVu?: number;    // alias khác
  thoiGian: string;
  trangThai: string;
}

// Mục trong unified cart (sản phẩm hoặc dịch vụ)
interface CartItem {
  id: string;          // maSP hoặc maLich
  type: 'product' | 'service';
  name: string;
  price: number;       // đơn giá
  qty?: number;        // chỉ sản phẩm
  total: number;       // thành tiền
  status?: string;     // chỉ dịch vụ
  scheduledAt?: string;// chỉ dịch vụ
  staffName?: string;  // chỉ dịch vụ
  // refs gốc
  raw: GioHangDTO | LichHenDTO;
  selected: boolean;
}

type Step = 'cart' | 'shipping' | 'payment' | 'qr' | 'success';
type PaymentMethod = 'cash' | 'bank_transfer' | 'momo' | 'zalopay';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
}

const BANK_INFO: BankInfo = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'CUA HANG THU CUNG PET SHOP',
  branch: 'Chi nhánh TP.HCM',
};

const SHIPPING_FEE = 30000;

function buildVietQRUrl(amount: number, description: string): string {
  return `https://img.vietqr.io/image/VCB-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
}
function buildMomoQRUrl(amount: number, description: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`momo://app?action=payWithAppToken&isSandbox=false&amount=${amount}&description=${description}&phone=0901234567`)}`;
}
function buildZaloPayQRUrl(amount: number, description: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`zalopay://app?action=payToMerchant&amount=${amount}&description=${description}&phone=0901234567`)}`;
}

const fmtVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Map trạng thái backend enum → label hiển thị (dùng đúng enum backend)
const TRANG_THAI_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Chờ thanh toán', color: 'text-orange-600 bg-orange-50 border-orange-300' },
  CONFIRMED:   { label: 'Chờ xác nhận',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  DONE:        { label: 'Hoàn thành',    color: 'text-green-600 bg-green-50 border-green-200' },
  CANCEL:      { label: 'Đã hủy',        color: 'text-red-600 bg-red-50 border-red-200' },
};

const STEPS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'cart', label: 'Giỏ hàng', icon: <ShoppingCart className="w-4 h-4" /> },
  { key: 'shipping', label: 'Giao hàng', icon: <MapPin className="w-4 h-4" /> },
  { key: 'payment', label: 'Thanh toán', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'success', label: 'Hoàn tất', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export default function CartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('cart');
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandProducts, setExpandProducts] = useState(true);
  const [expandServices, setExpandServices] = useState(true);

  // Shipping
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');

  // QR countdown
  const [qrVerifying, setQrVerifying] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(300);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auth ──
  useEffect(() => {
    const user = getCurrentUser() as any;
    if (!user || !user.userID) { router.push('/login'); return; }
    const uid = String(user.userID);
    setUserId(uid);
    fetchAll(uid, user);
  }, []);

  // ── Fetch cả giỏ hàng sản phẩm và lịch hẹn dịch vụ ──
  const fetchAll = async (maUser: string, userObj?: any) => {
    try {
      setLoading(true);

      // Sản phẩm
      const res = await gioHangService.getByMaUser(maUser);
      // apiClient interceptor có thể đã unwrap .data, hoặc chưa
      let rawItems: any = res.data ?? res ?? [];
      // Nếu backend bọc trong {status, message, data: [...]}
      if (rawItems && !Array.isArray(rawItems) && rawItems.data) {
        rawItems = rawItems.data;
      }
      if (!Array.isArray(rawItems)) rawItems = [];
      // Backend trả BigDecimal donGia đúng đơn vị VNĐ — không nhân hệ số
      const products: GioHangDTO[] = rawItems.map((item: any) => {
        const donGia = Number(item.donGia ?? item.gia ?? item.giaSP ?? 0);
        const soLuong = Number(item.soLuong ?? 1);
        // thanhTien backend đã tính = soLuong * donGia; nếu thiếu thì tính lại
        const thanhTien = Number(item.thanhTien ?? item.tongTien ?? 0) || donGia * soLuong;
        return { ...item, donGia, thanhTien, soLuong };
      });

      // Dịch vụ / lịch hẹn
      // maKH trong LichHen có thể là userID hoặc maKH riêng → thử cả hai
      let services: LichHenDTO[] = [];
      try {
        // Tập hợp các ID khả năng để thử
        const candidateIds = Array.from(new Set([
          maUser,
          userObj?.maKH ? String(userObj.maKH) : null,
          userObj?.id ? String(userObj.id) : null,
        ].filter(Boolean))) as string[];

        const allResults: LichHenDTO[] = [];
        for (const id of candidateIds) {
          try {
            const lichRes = await lichHenService.searchLichHen({ maKH: id, size: 100 });
            if (Array.isArray(lichRes?.data) && lichRes.data.length > 0) {
              allResults.push(...lichRes.data);
            }
          } catch {
            // bỏ qua lỗi cho từng ID
          }
        }
        // Loại trùng theo maLich
        const seen = new Set<string>();
        services = allResults.filter((l) => {
          if (seen.has(l.maLich)) return false;
          seen.add(l.maLich);
          return true;
        });
      } catch {
        services = [];
      }

      // Gộp thành unified cart
      const productItems: CartItem[] = products.map((p, idx) => ({
        id: p.maSP,
        type: 'product',
        name: p.tenSP,
        price: Number(p.donGia),
        qty: p.soLuong,
        total: Number(p.thanhTien),
        raw: p,
        selected: true,
      }));

      // ── Lấy giá dịch vụ: fetch từ API, cache theo maDV ──
      // KHÔNG dùng l.giaDV từ LichHenDTO vì DichVu là LAZY → có thể null/0
      // khi convertToDTO chạy ngoài transaction scope (LazyInitializationException bị catch ngầm)
      const dichVuGiaCache = new Map<string, number>();
      const uniqueMaDVs = [...new Set(
        services.filter(l => l.trangThai !== 'CANCEL' && l.maDV).map(l => l.maDV)
      )];
      await Promise.all(
        uniqueMaDVs.map(async (maDV) => {
          try {
            const dvDTO = await dichVuService.getDichVuById(maDV);
            // getDichVuById đã unwrap → trả DichVuDTO { maDV, gia, ... }
            // hoặc { status, message, data: { gia } } nếu chưa unwrap hết
            const giaRaw = dvDTO?.gia ?? dvDTO?.data?.gia ?? null;
            dichVuGiaCache.set(maDV, Number(giaRaw ?? 0));
          } catch {
            dichVuGiaCache.set(maDV, 0);
          }
        })
      );

      // Chỉ hiển thị lịch hẹn chưa hủy
      const serviceItems: CartItem[] = services
        .filter(l => l.trangThai !== 'CANCEL')
        .map((l) => {
          // Ưu tiên: cache API → giaDV từ DTO → 0
          const giaVND = dichVuGiaCache.get(l.maDV) || Number(l.giaDV ?? l.gia ?? 0);
          const trangThaiFinal = l.trangThai || 'PENDING';

          return {
            id: l.maLich,
            type: 'service' as const,
            name: l.tenDV || `Dịch vụ ${l.maDV}`,
            price: giaVND,
            total: giaVND,
            status: trangThaiFinal,
            scheduledAt: l.thoiGian,
            staffName: l.tenNV,
            raw: { ...l, trangThai: trangThaiFinal },
            selected: trangThaiFinal === 'PENDING',
          };
        });

      setCartItems([...productItems, ...serviceItems]);
    } catch (e) {
      console.error(e);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle chọn mục ──
  const toggleSelect = (id: string) => {
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  // ── Toggle chọn tất cả nhóm ──
  const toggleSelectGroup = (type: 'product' | 'service') => {
    const group = cartItems.filter(i => {
      if (i.type !== type) return false;
      // Với dịch vụ, chỉ toggle những item có thể chọn (PENDING)
      if (type === 'service') {
        const lich = i.raw as LichHenDTO;
        return lich.trangThai === 'PENDING';
      }
      return true;
    });
    const allSelected = group.every(i => i.selected);
    setCartItems(prev => prev.map(item => {
      if (item.type !== type) return item;
      if (type === 'service') {
        const lich = item.raw as LichHenDTO;
        if (lich.trangThai !== 'PENDING') return item; // không thay đổi item không thể chọn
      }
      return { ...item, selected: !allSelected };
    }));
  };

  // ── Remove sản phẩm ──
  const handleRemoveProduct = async (item: CartItem) => {
    if (!userId) return;
    const p = item.raw as GioHangDTO;
    try {
      await gioHangService.deleteItem(p.maGioHang, p.maSP);
      await fetchAll(userId, getCurrentUser());
      window.dispatchEvent(new Event('cartUpdate'));
    } catch {
      alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  // ── Xóa TẤT CẢ sản phẩm trong giỏ ──
  const handleRemoveAllProducts = async () => {
    if (!userId) return;
    if (!confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) return;
    const items = cartItems.filter(i => i.type === 'product');
    try {
      await Promise.all(
        items.map(item => {
          const p = item.raw as GioHangDTO;
          return gioHangService.deleteItem(p.maGioHang, p.maSP);
        })
      );
      await fetchAll(userId, getCurrentUser());
      window.dispatchEvent(new Event('cartUpdate'));
    } catch {
      alert('Có lỗi khi xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  // ── Hủy lịch hẹn → xóa khỏi giỏ hàng ngay ──
  const handleCancelLichHen = async (maLich: string) => {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await lichHenService.cancelLichHen(maLich);
      setCartItems(prev => prev.filter(i => i.id !== maLich));
      window.dispatchEvent(new Event('cartUpdate'));
    } catch (e: any) {
      alert('Không thể hủy lịch hẹn: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
    }
  };

  // ── Hủy TẤT CẢ lịch hẹn PENDING ──
  const handleCancelAllLichHen = async () => {
    const pendingItems = cartItems.filter(
      i => i.type === 'service' && (i.raw as LichHenDTO).trangThai === 'PENDING'
    );
    if (pendingItems.length === 0) return;
    if (!confirm(`Bạn có chắc muốn hủy tất cả ${pendingItems.length} lịch hẹn đang chờ?`)) return;
    const errors: string[] = [];
    await Promise.all(
      pendingItems.map(async item => {
        try {
          await lichHenService.cancelLichHen(item.id);
        } catch (e: any) {
          errors.push(item.id);
        }
      })
    );
    // Xóa những cái đã hủy thành công khỏi UI
    const cancelledIds = new Set(pendingItems.map(i => i.id).filter(id => !errors.includes(id)));
    setCartItems(prev => prev.filter(i => !cancelledIds.has(i.id)));
    window.dispatchEvent(new Event('cartUpdate'));
    if (errors.length > 0) {
      alert(`Hủy thất bại ${errors.length} lịch hẹn. Vui lòng thử lại.`);
    }
  };

  // ── Change qty sản phẩm ──
  // Backend saveRequest() luôn CỘNG DỒN soLuong khi item đã tồn tại
  // → Giải pháp: xóa item hiện tại rồi tạo lại với soLuong mới (set tuyệt đối)
  const handleQtyChange = async (item: CartItem, delta: number) => {
    if (!userId) return;
    const p = item.raw as GioHangDTO;
    const newQty = (item.qty || 1) + delta;
    if (newQty < 1) return;

    // Optimistic update để UI phản hồi ngay
    setCartItems(prev => prev.map(ci => {
      if (ci.id !== item.id) return ci;
      return { ...ci, qty: newQty, total: (ci.price || 0) * newQty };
    }));

    try {
      // Bước 1: Xóa item hiện tại
      await gioHangService.deleteItem(p.maGioHang, p.maSP);
      // Bước 2: Tạo lại với số lượng mới (backend sẽ insert với soLuong = newQty)
      await gioHangService.save({
        maSP: p.maSP,
        soLuong: newQty,
        maUser: p.maUser,
      });
      await fetchAll(userId, getCurrentUser());
      window.dispatchEvent(new Event('cartUpdate'));
    } catch (err: any) {
      // Rollback về dữ liệu thực
      await fetchAll(userId, getCurrentUser());
      alert('Không thể cập nhật số lượng: ' + (err?.response?.data?.message || err?.message || 'Lỗi không xác định'));
    }
  };

  // ── Validate shipping ──
  const validateShipping = () => {
    let ok = true;
    // Nếu có sản phẩm được chọn mới cần địa chỉ
    const hasSelectedProduct = selectedItems.some(i => i.type === 'product');
    if (hasSelectedProduct) {
      if (!address.trim()) { setAddressError('Vui lòng nhập địa chỉ giao hàng'); ok = false; }
      else setAddressError('');
      if (!phone.trim() || !/^(0|\+84)[0-9]{8,9}$/.test(phone.trim())) {
        setPhoneError('Số điện thoại không hợp lệ'); ok = false;
      } else setPhoneError('');
    } else {
      setAddressError('');
      setPhoneError('');
    }
    return ok;
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;
    // COD hoặc chỉ có dịch vụ (không cần QR) → đặt ngay
    const onlyServices = selectedItems.every(i => i.type === 'service');
    if (paymentMethod === 'cash' || onlyServices) {
      await submitOrder();
    } else {
      setStep('qr');
      startCountdown();
    }
  };

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const selectedProducts = selectedItems.filter(i => i.type === 'product');
      const selectedServices = selectedItems.filter(i => i.type === 'service');

      let newOrderId = '';

      if (selectedProducts.length > 0) {
        // ── Bước 1: Tạo header đơn hàng ──
        // DonHangRequest chỉ chấp nhận: maDH, maKH, maNV, ngayTao, trangThai
        // → KHÔNG gửi các field thừa như phuongThucThanhToan, diaChiGiaoHang,...
        // maNV để null/rỗng → backend sẽ gán nhân viên sau khi xử lý
        const headerPayload = {
          maKH: userId,
          maNV: '1',  // ID nhân viên mặc định (Integer) — chỉnh theo dữ liệu thực tế
          ngayTao: new Date().toISOString().split('T')[0],
          trangThai: paymentMethod === 'cash' ? 'CONFIRMED' : 'PENDING',
        };

        const res = await donHangService.createDonHang(headerPayload);
        // DonHangController dùng BaseController.resCreated → { status, message, data: DonHangDTO }
        // apiClient interceptor unwrap nếu data.data là array — DonHangDTO không phải array
        // → res.data vẫn là { status, message, data: { maDH, ... } } hoặc đã unwrap
        const resRaw = res?.data as any;
        const donHangDTO = resRaw?.data ?? resRaw;
        newOrderId = donHangDTO?.maDH || ('DH' + Date.now());

        // ── Bước 2: Thêm từng chi tiết đơn hàng ──
        // ChiTietDonHangRequest: { maDH, maSP, soLuong (Integer), donGia (BigDecimal) }
        for (const item of selectedProducts) {
          const p = item.raw as GioHangDTO;
          try {
            await donHangService.addChiTiet({
              maDH: newOrderId,
              maSP: p.maSP,
              soLuong: item.qty ?? p.soLuong ?? 1,
              donGia: item.price ?? p.donGia,
            });
          } catch (err: any) {
            console.warn('Không thể thêm chi tiết đơn hàng:', p.maSP, err);
          }
        }

        // ── Bước 3: Xóa sản phẩm đã đặt khỏi giỏ hàng ──
        for (const item of selectedProducts) {
          const p = item.raw as GioHangDTO;
          try {
            await gioHangService.deleteItem(p.maGioHang, p.maSP);
          } catch (err) {
            console.warn('Không thể xóa sản phẩm khỏi giỏ hàng:', p.maSP, err);
          }
        }
      }

      // ── Bước 4: Cập nhật lịch hẹn dịch vụ → CONFIRMED (đã thanh toán) ──
      for (const svcItem of selectedServices) {
        const lich = svcItem.raw as LichHenDTO;
        try {
          await lichHenService.updateTrangThai(lich.maLich, 'CONFIRMED');
        } catch (err) {
          console.warn('Không thể cập nhật trạng thái lịch hẹn:', lich.maLich, err);
        }
      }

      setOrderId(newOrderId || ('SVC' + Date.now()));
      window.dispatchEvent(new Event('cartUpdate'));
      setStep('success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Lỗi không xác định';
      alert('Đặt hàng thất bại: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const startCountdown = () => {
    setQrCountdown(300);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const handleConfirmTransfer = async () => {
    setQrVerifying(true);
    await new Promise(r => setTimeout(r, 2000));
    setQrVerifying(false);
    await submitOrder();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Computed ──
  const selectedItems = cartItems.filter(i => i.selected);
  const productItems = cartItems.filter(i => i.type === 'product');
  const serviceItems = cartItems.filter(i => i.type === 'service');
  const selectedProductItems = selectedItems.filter(i => i.type === 'product');
  const selectedServiceItems = selectedItems.filter(i => i.type === 'service');

  const productSubtotal = selectedProductItems.reduce((s, i) => s + i.total, 0);
  const serviceSubtotal = selectedServiceItems.reduce((s, i) => s + i.total, 0);
  const hasSelectedProduct = selectedProductItems.length > 0;
  const shippingFee = hasSelectedProduct ? SHIPPING_FEE : 0;
  const totalAmount = productSubtotal + serviceSubtotal + shippingFee;

  const qrDescription = `PETSHOP ${userId} ${Date.now()}`;

  const currentStepIdx = ['cart', 'shipping', 'payment', 'success'].indexOf(
    step === 'qr' ? 'payment' : step
  );

  const paymentMethods = [
    { key: 'bank_transfer' as PaymentMethod, label: 'Chuyển khoản ngân hàng', sub: 'Vietcombank • Miễn phí', icon: <Banknote className="w-5 h-5" />, color: 'text-green-600' },
    { key: 'momo' as PaymentMethod, label: 'Ví MoMo', sub: 'Quét QR thanh toán nhanh', icon: <span className="text-lg">💜</span>, color: 'text-pink-600' },
    { key: 'zalopay' as PaymentMethod, label: 'ZaloPay', sub: 'Quét QR thanh toán nhanh', icon: <span className="text-lg">🔵</span>, color: 'text-blue-600' },
    { key: 'cash' as PaymentMethod, label: 'Thanh toán khi nhận hàng (COD)', sub: 'Trả tiền mặt cho shipper', icon: <span className="text-lg">💵</span>, color: 'text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b py-6">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {step === 'success' ? '✅ Đặt hàng thành công' : '🛒 Giỏ hàng'}
            </h1>

            {/* Step indicator */}
            {step !== 'success' && step !== 'cart' && (
              <div className="flex items-center gap-0">
                {STEPS.filter(s => s.key !== 'success').map((s, idx) => {
                  const active = currentStepIdx === idx;
                  const done = currentStepIdx > idx;
                  return (
                    <div key={s.key} className="flex items-center">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        active ? 'bg-orange-600 text-white' :
                        done ? 'bg-orange-100 text-orange-700' :
                        'text-gray-400'
                      }`}>
                        {s.icon}
                        <span className="hidden sm:inline">{s.label}</span>
                      </div>
                      {idx < 2 && (
                        <ChevronRight className={`w-4 h-4 mx-1 ${done ? 'text-orange-400' : 'text-gray-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ══════════════════════════════════════
              STEP: CART – Giỏ hàng thống nhất
          ══════════════════════════════════════ */}
          {step === 'cart' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">

                {cartItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border p-16 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-400 mb-6 text-sm">Hãy thêm sản phẩm hoặc đặt lịch dịch vụ</p>
                    <div className="flex gap-3 justify-center">
                      <Link href="/products">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">Mua sản phẩm</Button>
                      </Link>
                      <Link href="/services">
                        <Button variant="outline" className="border-orange-200 text-orange-600">Đặt dịch vụ</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ── NHÓM SẢN PHẨM ── */}
                    {productItems.length > 0 && (
                      <div className="bg-white rounded-2xl border overflow-hidden">
                        <div
                          className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between cursor-pointer select-none"
                          onClick={() => setExpandProducts(v => !v)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Select all products */}
                            <input
                              type="checkbox"
                              checked={productItems.every(i => i.selected)}
                              onChange={(e) => { e.stopPropagation(); toggleSelectGroup('product'); }}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 accent-orange-600 cursor-pointer"
                            />
                            <ShoppingCart className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold text-gray-700">Sản phẩm ({productItems.length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-600 font-semibold">
                              {fmtVND(productSubtotal)}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveAllProducts(); }}
                              className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition flex items-center gap-1"
                              title="Xóa tất cả sản phẩm"
                            >
                              <Trash2 className="w-3 h-3" /> Xóa tất cả
                            </button>
                            {expandProducts ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {expandProducts && productItems.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                              item.selected ? 'bg-white' : 'bg-gray-50 opacity-70'
                            } ${idx < productItems.length - 1 ? 'border-b' : ''}`}
                          >
                            {/* Checkbox chọn */}
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleSelect(item.id)}
                              className="w-4 h-4 accent-orange-600 cursor-pointer flex-shrink-0"
                            />
                            <div className="w-18 h-18 w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl border border-orange-100">
                              🐾
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                              <p className="text-orange-600 font-bold text-sm mt-1">
                                {fmtVND(item.price)} / sản phẩm
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => handleQtyChange(item, -1)}
                                  disabled={(item.qty || 1) <= 1}
                                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 font-bold text-lg leading-none"
                                >−</button>
                                <span className="w-8 text-center font-semibold text-gray-800">{item.qty}</span>
                                <button
                                  onClick={() => handleQtyChange(item, 1)}
                                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none"
                                >+</button>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900">{fmtVND(item.total)}</p>
                              <button
                                onClick={() => handleRemoveProduct(item)}
                                className="mt-2 text-gray-300 hover:text-red-500 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── NHÓM DỊCH VỤ / LỊCH HẸN ── */}
                    {serviceItems.length > 0 && (
                      <div className="bg-white rounded-2xl border overflow-hidden">
                        <div
                          className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between cursor-pointer select-none"
                          onClick={() => setExpandServices(v => !v)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={serviceItems.filter(i => (i.raw as LichHenDTO).trangThai === 'PENDING').length > 0 &&
                                serviceItems.filter(i => (i.raw as LichHenDTO).trangThai === 'PENDING').every(i => i.selected)}
                              onChange={(e) => { e.stopPropagation(); toggleSelectGroup('service'); }}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 accent-orange-600 cursor-pointer"
                            />
                            <Scissors className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold text-gray-700">Dịch vụ / Lịch hẹn ({serviceItems.length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-600 font-semibold">
                              {fmtVND(serviceSubtotal)}
                            </span>
                            {serviceItems.some(i => (i.raw as LichHenDTO).trangThai === 'PENDING') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCancelAllLichHen(); }}
                                className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition flex items-center gap-1"
                                title="Hủy tất cả lịch hẹn đang chờ"
                              >
                                <X className="w-3 h-3" /> Hủy tất cả
                              </button>
                            )}
                            {expandServices ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Banner nhắc thanh toán 24h nếu có lịch PENDING */}
                        {expandServices && serviceItems.some(i => (i.raw as LichHenDTO).trangThai === 'PENDING') && (
                          <div className="mx-4 mt-3 mb-1 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <p className="text-xs text-orange-700 font-semibold">
                              Lịch hẹn cần được thanh toán trong vòng 24 giờ. Quá hạn sẽ tự động bị hủy.
                            </p>
                          </div>
                        )}

                        {expandServices && serviceItems.map((item, idx) => {
                          const lich = item.raw as LichHenDTO;
                          // thoiGian có thể là ISO string hoặc array [yyyy,MM,dd,HH,mm] từ Jackson
                          const dt = lich.thoiGian
                            ? (Array.isArray(lich.thoiGian)
                                ? new Date((lich.thoiGian as any)[0], (lich.thoiGian as any)[1]-1, (lich.thoiGian as any)[2], (lich.thoiGian as any)[3]||0, (lich.thoiGian as any)[4]||0)
                                : new Date(lich.thoiGian))
                            : null;
                          const status = TRANG_THAI_LABEL[lich.trangThai] || { label: lich.trangThai, color: 'text-gray-600 bg-gray-50 border-gray-200' };
                          const isPending = !['DONE', 'CANCEL'].includes(lich.trangThai);
                          // Chỉ PENDING mới được chọn để thanh toán
                          const canSelect = lich.trangThai === 'PENDING';


                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-0 transition-colors ${
                                item.selected ? 'bg-white' : 'bg-gray-50 opacity-70'
                              } ${idx < serviceItems.length - 1 ? 'border-b' : ''}`}
                            >
                              {/* Thanh màu trạng thái */}
                              <div className={`w-1.5 self-stretch flex-shrink-0 ${
                                lich.trangThai === 'DONE' ? 'bg-green-500' :
                                lich.trangThai === 'CANCEL' ? 'bg-gray-300' :
                                lich.trangThai === 'CONFIRMED' ? 'bg-blue-500' :
                                lich.trangThai === 'IN_PROGRESS' ? 'bg-purple-500' :
                                'bg-yellow-400'
                              }`} />

                              <div className="flex-1 flex items-center gap-4 px-5 py-4">
                                {/* Checkbox */}
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  disabled={!canSelect}
                                  onChange={() => canSelect && toggleSelect(item.id)}
                                  className="w-4 h-4 accent-orange-600 cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
                                  title={!canSelect
                                    ? lich.trangThai === 'CANCEL' ? 'Lịch đã bị hủy'
                                      : lich.trangThai === 'DONE' ? 'Dịch vụ đã hoàn thành'
                                      : lich.trangThai === 'CONFIRMED' ? 'Đang chờ cửa hàng xác nhận'
                                      : lich.trangThai === 'IN_PROGRESS' ? 'Đang thực hiện dịch vụ'
                                      : 'Không thể chọn'
                                    : ''
                                  }
                                />

                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl border border-orange-100">
                                  ✂️
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                                      {status.label}
                                    </span>

                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                    {dt && (
                                      <>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {dt.toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </>
                                    )}
                                    {lich.tenNV && (
                                      <span className="flex items-center gap-1 text-gray-400">👤 {lich.tenNV}</span>
                                    )}
                                    {/* Giải thích tại sao không thể chọn */}
                                    {!canSelect && isPending && (
                                      <span className="text-gray-400 italic">
                                        {lich.trangThai === 'CONFIRMED' ? '(Cửa hàng đang xử lý)'
                                          : lich.trangThai === 'IN_PROGRESS' ? '(Đang thực hiện)'
                                          : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {item.price > 0 && (
                                    <span className="font-bold text-orange-600">{fmtVND(item.price)}</span>
                                  )}
                                  {isPending && (
                                    <button
                                      onClick={() => handleCancelLichHen(lich.maLich)}
                                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-xl transition"
                                    >
                                      Hủy
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="px-6 py-3 border-t bg-gray-50">
                          <Link href="/services">
                            <button className="text-sm text-orange-600 hover:underline font-medium">
                              + Đặt thêm dịch vụ
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Gợi ý thêm */}
                    <div className="flex gap-3 text-sm">
                      {productItems.length === 0 && (
                        <Link href="/products">
                          <button className="text-orange-600 hover:underline">+ Thêm sản phẩm</button>
                        </Link>
                      )}
                      {serviceItems.length === 0 && (
                        <Link href="/services">
                          <button className="text-orange-600 hover:underline">+ Đặt dịch vụ</button>
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ── Sidebar tóm tắt ── */}
              {cartItems.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border p-6 sticky top-24">
                    <h2 className="font-bold text-gray-900 text-lg mb-4">Tóm tắt thanh toán</h2>
                    <div className="space-y-3 text-sm">
                      {selectedProductItems.length > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Sản phẩm ({selectedProductItems.length})</span>
                          <span className="font-medium text-gray-900">{fmtVND(productSubtotal)}</span>
                        </div>
                      )}
                      {selectedServiceItems.length > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Dịch vụ ({selectedServiceItems.length})</span>
                          <span className="font-medium text-gray-900">{fmtVND(serviceSubtotal)}</span>
                        </div>
                      )}
                      {hasSelectedProduct && (
                        <div className="flex justify-between text-gray-600">
                          <span>Phí giao hàng</span>
                          <span className="font-medium text-gray-900">{fmtVND(SHIPPING_FEE)}</span>
                        </div>
                      )}
                      {selectedItems.length === 0 && (
                        <p className="text-gray-400 text-xs text-center py-2">Chưa chọn mục nào</p>
                      )}
                    </div>
                    <div className="border-t my-4" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-2xl font-black text-orange-600">{fmtVND(totalAmount)}</span>
                    </div>
                    <Button
                      className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white py-3 text-base font-semibold rounded-xl disabled:opacity-50"
                      onClick={() => setStep('shipping')}
                      disabled={selectedItems.length === 0}
                    >
                      Tiến hành thanh toán <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    {selectedItems.length === 0 && (
                      <p className="text-center text-xs text-gray-400 mt-2">Hãy chọn ít nhất 1 mục</p>
                    )}
                    <p className="text-center text-xs text-gray-400 mt-3">🔒 Thanh toán bảo mật & an toàn</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              STEP: SHIPPING
          ══════════════════════════════════════ */}
          {step === 'shipping' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" /> Thông tin giao hàng
                  </h2>
                  {!hasSelectedProduct && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Bạn chỉ đặt dịch vụ — không cần giao hàng. Bạn có thể bỏ qua phần này.
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Địa chỉ nhận hàng {hasSelectedProduct && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => { setAddress(e.target.value); setAddressError(''); }}
                        placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${addressError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      {addressError && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {addressError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Số điện thoại {hasSelectedProduct && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                        placeholder="VD: 0901234567"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${phoneError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      {phoneError && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {phoneError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú</label>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>
                    {hasSelectedProduct && (
                      <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
                        <Package className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-orange-800">Giao hàng tiêu chuẩn</p>
                          <p className="text-orange-600">Dự kiến 2–4 ngày làm việc · {fmtVND(SHIPPING_FEE)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep('cart')} className="flex-1 border-gray-200">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                  </Button>
                  <Button
                    onClick={() => { if (validateShipping()) setStep('payment'); }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Tiếp tục <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
              <UnifiedSummaryCard
                selectedProductItems={selectedProductItems}
                selectedServiceItems={selectedServiceItems}
                productSubtotal={productSubtotal}
                serviceSubtotal={serviceSubtotal}
                shippingFee={shippingFee}
                total={totalAmount}
              />
            </div>
          )}

          {/* ══════════════════════════════════════
              STEP: PAYMENT
          ══════════════════════════════════════ */}
          {step === 'payment' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" /> Phương thức thanh toán
                  </h2>
                  <div className="space-y-3">
                    {paymentMethods.map(pm => (
                      <button
                        key={pm.key}
                        onClick={() => setPaymentMethod(pm.key)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === pm.key ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === pm.key ? 'bg-orange-100' : 'bg-gray-100'} ${pm.color} flex-shrink-0`}>
                          {pm.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{pm.label}</p>
                          <p className="text-xs text-gray-500">{pm.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.key ? 'border-orange-500' : 'border-gray-300'}`}>
                          {paymentMethod === pm.key && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                      <p className="font-semibold text-green-800 mb-2">📋 Thông tin chuyển khoản</p>
                      <div className="space-y-1 text-green-700">
                        <p>Ngân hàng: <strong>{BANK_INFO.bankName}</strong></p>
                        <p>Số tài khoản: <strong>{BANK_INFO.accountNumber}</strong></p>
                        <p>Chủ tài khoản: <strong>{BANK_INFO.accountName}</strong></p>
                        <p className="text-xs text-green-600 mt-2">✅ Mã QR VietQR sẽ được tạo tự động ở bước tiếp theo</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep('shipping')} className="flex-1 border-gray-200">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang xử lý...</>
                      : paymentMethod === 'cash'
                        ? '✅ Đặt hàng ngay'
                        : <><QrCode className="w-4 h-4 mr-2" /> Lấy mã QR thanh toán</>
                    }
                  </Button>
                </div>
              </div>
              <UnifiedSummaryCard
                selectedProductItems={selectedProductItems}
                selectedServiceItems={selectedServiceItems}
                productSubtotal={productSubtotal}
                serviceSubtotal={serviceSubtotal}
                shippingFee={shippingFee}
                total={totalAmount}
                address={address}
                phone={phone}
              />
            </div>
          )}

          {/* ══════════════════════════════════════
              STEP: QR
          ══════════════════════════════════════ */}
          {step === 'qr' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border overflow-hidden">
                  <div className={`px-6 py-4 text-white flex items-center justify-between ${
                    paymentMethod === 'momo' ? 'bg-pink-600' :
                    paymentMethod === 'zalopay' ? 'bg-blue-600' : 'bg-green-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <QrCode className="w-6 h-6" />
                      <div>
                        <p className="font-bold">
                          {paymentMethod === 'bank_transfer' ? `QR ${BANK_INFO.bankName} (VietQR)` :
                           paymentMethod === 'momo' ? 'Thanh toán MoMo' : 'Thanh toán ZaloPay'}
                        </p>
                        <p className="text-xs opacity-80">Quét mã để thanh toán</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80">Hết hạn sau</p>
                      <p className="font-bold text-lg">
                        {String(Math.floor(qrCountdown / 60)).padStart(2, '0')}:
                        {String(qrCountdown % 60).padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-shrink-0">
                        {qrCountdown === 0 ? (
                          <div className="w-56 h-56 bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300">
                            <X className="w-10 h-10 text-gray-400" />
                            <p className="text-sm text-gray-500">Mã QR đã hết hạn</p>
                            <button onClick={startCountdown} className="text-xs text-orange-600 font-semibold hover:underline">Tạo lại mã QR</button>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-56 h-56 bg-white border-4 border-gray-100 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  paymentMethod === 'bank_transfer'
                                    ? buildVietQRUrl(totalAmount, qrDescription)
                                    : paymentMethod === 'momo'
                                      ? buildMomoQRUrl(totalAmount, qrDescription)
                                      : buildZaloPayQRUrl(totalAmount, qrDescription)
                                }
                                alt="QR thanh toán"
                                className="w-full h-full object-contain"
                                onError={e => {
                                  (e.target as HTMLImageElement).src =
                                    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrDescription + totalAmount)}`;
                                }}
                              />
                            </div>
                            <div className="absolute -inset-1 rounded-2xl border-2 border-orange-400 animate-pulse opacity-50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <p className="text-2xl font-black text-orange-600 mb-1">{fmtVND(totalAmount)}</p>
                        <p className="text-sm text-gray-500 mb-4">Tổng thanh toán</p>
                        {paymentMethod === 'bank_transfer' && (
                          <div className="space-y-3">
                            {[
                              { label: 'Ngân hàng', value: BANK_INFO.bankName },
                              { label: 'Số tài khoản', value: BANK_INFO.accountNumber, copyable: true },
                              { label: 'Chủ tài khoản', value: BANK_INFO.accountName },
                              { label: 'Số tiền', value: fmtVND(totalAmount), copyable: true },
                              { label: 'Nội dung CK', value: qrDescription, copyable: true },
                            ].map(row => (
                              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <span className="text-xs text-gray-500 w-28 flex-shrink-0">{row.label}</span>
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                  <span className="text-sm font-semibold text-gray-900 text-right">{row.value}</span>
                                  {row.copyable && (
                                    <button onClick={() => handleCopy(row.value)} className="text-gray-400 hover:text-orange-500 flex-shrink-0">
                                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => { setStep('payment'); if (countdownRef.current) clearInterval(countdownRef.current); }}
                        className="flex-1 border-gray-200"
                      >
                        ← Chọn lại
                      </Button>
                      <Button
                        onClick={handleConfirmTransfer}
                        disabled={qrVerifying || qrCountdown === 0}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        {qrVerifying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang xác nhận...</> : '✅ Tôi đã thanh toán'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <UnifiedSummaryCard
                selectedProductItems={selectedProductItems}
                selectedServiceItems={selectedServiceItems}
                productSubtotal={productSubtotal}
                serviceSubtotal={serviceSubtotal}
                shippingFee={shippingFee}
                total={totalAmount}
                address={address}
                phone={phone}
              />
            </div>
          )}

          {/* ══════════════════════════════════════
              STEP: SUCCESS
          ══════════════════════════════════════ */}
          {step === 'success' && (
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-white rounded-2xl border p-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Đặt thành công! 🎉</h2>
                {orderId && (
                  <>
                    <p className="text-gray-500 mb-1">Mã đơn hàng</p>
                    <p className="text-xl font-bold text-orange-600 mb-4">{orderId}</p>
                  </>
                )}
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
                  {selectedProductItems.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sản phẩm ({selectedProductItems.length})</span>
                      <span className="font-medium text-gray-800">{fmtVND(productSubtotal)}</span>
                    </div>
                  )}
                  {selectedServiceItems.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dịch vụ ({selectedServiceItems.length})</span>
                      <span className="font-medium text-gray-800">{fmtVND(serviceSubtotal)}</span>
                    </div>
                  )}
                  {hasSelectedProduct && address && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Giao đến</span>
                      <span className="font-medium text-gray-800 text-right max-w-xs">{address}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Liên hệ</span>
                      <span className="font-medium text-gray-800">{phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thanh toán</span>
                    <span className="font-medium text-gray-800">
                      {paymentMethod === 'cash' ? 'COD – Khi nhận hàng' :
                       paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                       paymentMethod === 'momo' ? 'Ví MoMo' : 'ZaloPay'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold text-gray-900">Tổng tiền</span>
                    <span className="font-black text-orange-600">{fmtVND(totalAmount)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/customer/orders" className="flex-1">
                    <Button variant="outline" className="w-full border-gray-200">Xem đơn hàng</Button>
                  </Link>
                  <Link href="/products" className="flex-1">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Tiếp tục mua sắm</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─── Sidebar tóm tắt thống nhất ────────────────────────────
function UnifiedSummaryCard({
  selectedProductItems,
  selectedServiceItems,
  productSubtotal,
  serviceSubtotal,
  shippingFee,
  total,
  address,
  phone,
}: {
  selectedProductItems: CartItem[];
  selectedServiceItems: CartItem[];
  productSubtotal: number;
  serviceSubtotal: number;
  shippingFee: number;
  total: number;
  address?: string;
  phone?: string;
}) {
  const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl border p-5 sticky top-24 space-y-4">
        <h3 className="font-bold text-gray-900">Đơn hàng của bạn</h3>

        {selectedProductItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Sản phẩm</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {selectedProductItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-xs flex-shrink-0">{item.qty}</span>
                  <span className="flex-1 text-gray-700 truncate">{item.name}</span>
                  <span className="font-semibold text-gray-900 flex-shrink-0">{fmtVND(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedServiceItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Dịch vụ</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {selectedServiceItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xl flex-shrink-0">✂️</span>
                  <span className="flex-1 text-gray-700 truncate">{item.name}</span>
                  <span className="font-semibold text-gray-900 flex-shrink-0">{fmtVND(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-3 space-y-1.5 text-sm">
          {selectedProductItems.length > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Tạm tính SP</span>
              <span>{fmtVND(productSubtotal)}</span>
            </div>
          )}
          {selectedServiceItems.length > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Tạm tính DV</span>
              <span>{fmtVND(serviceSubtotal)}</span>
            </div>
          )}
          {shippingFee > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Vận chuyển</span>
              <span>{fmtVND(shippingFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
            <span>Tổng cộng</span>
            <span className="text-orange-600">{fmtVND(total)}</span>
          </div>
        </div>
        {address && (
          <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
            <p className="flex gap-1"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-400" />{address}</p>
            {phone && <p className="pl-4">{phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
