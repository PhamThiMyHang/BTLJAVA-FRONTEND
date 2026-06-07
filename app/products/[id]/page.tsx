'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { isAuthenticated, getCurrentUser } from '@/lib/auth'; // Import các hàm auth
import { gioHangService } from '@/services/gioHangService';
import { yeuThichService } from '@/services/yeuThichService';
import { useTranslation } from 'react-i18next';


export default function ProductDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch product by ID
  useEffect(() => {
    if (!productId) return;

    fetch(`http://localhost:8080/api/san-pham/${productId}`)
      .then(res => res.json())
      .then(result => {
        const item = result.data;

        const mapped = {
          id: item.maSP,
          name: item.tenSP,
          price: item.gia,
          quantity: item.soLuong,
          shelf: item.viTri,
          urlImg: item.urlImg, // BỔ SUNG DÒNG NÀY
          rating: 4.5
        };

        setProduct(mapped);
        setLoading(false);
      })
      .catch(err => console.error("Lỗi API:", err));
  }, [productId]);

  // Fetch related products (same shelf)
  useEffect(() => {
    if (!product) return;

    fetch("http://localhost:8080/api/san-pham")
      .then(res => res.json())
      .then(result => {
        const mapped = result.data.map((item: any) => ({
          id: item.maSP,
          name: item.tenSP,
          price: item.gia,
          quantity: item.soLuong,
          shelf: item.viTri,
          urlImg: item.urlImg, // BỔ SUNG DÒNG NÀY
          rating: 4.5
        }));

        const related = mapped
          .filter((p: any) => p.shelf === product.shelf && p.id !== product.id)
          .slice(0, 4);

        setRelatedProducts(related);
      });
  }, [product]);


  
  // 1. Thêm state trong component
const [isLiked, setIsLiked] = useState(false);
const [likeCount, setLikeCount] = useState(0);

// 2. Kiểm tra trạng thái yêu thích khi trang load
useEffect(() => {
  if (product && isAuthenticated()) {
    const user = getCurrentUser() as any;
    yeuThichService.exists(String(user.userID), String(product.id))
      .then((res:any)  => setIsLiked(res.data))
      .catch(() => setIsLiked(false));
  }
}, [product]);

// Số lượt thích
useEffect(() => {
  if (!product) return;

  yeuThichService.count(product.id)
    .then((res: any) => {
      setLikeCount(res.data);
    })
    .catch((err) => {
      console.error("Lỗi lấy số lượt thích:", err);
    });
}, [product]);

const handleToggleLike = async () => {
  if (!isAuthenticated()) {
    router.push('/login');
    return;
  }
  const user = getCurrentUser() as any;
  console.log(user);
  if (!user) {
    router.push('/login');
    return;
  }
  try {
    if (isLiked) {
      // Gọi service delete (đã chuẩn hóa)
      await yeuThichService.delete(String(user.userID), String(product.id));
      setIsLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      // Gọi service add
      await yeuThichService.add({ maUser: String(user.userID), maSP: String(product.id) });
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  } catch (err) {
    console.error("Lỗi:", err);
  }
};


  if (loading || !product) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading.default')}</div>;
  }

  // Hàm xử lý thêm vào giỏ hàng thông qua kết nối API Backend
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      alert(t('common.messages.loginRequired'));
      router.push('/login'); 
      return;
    }

    if (quantity > product.quantity) {
      alert(t('productDetail.quantityLimit'));
      return;
    }

    try {
      // Lấy thông tin user đang đăng nhập
      const user = getCurrentUser() as any;
      if (!user || !user.userID) {
        alert(t('products.messages.missingUser'));
        return;
      }

      // Thiết lập cấu trúc dữ liệu gửi lên API
      // SỬA TẠI ĐÂY: Đồng bộ tên thuộc tính giống hệt phía trên
        const cartPayload = {
          maGioHang: null,
          maUser: String(user.userID),
          maSP: String(product.id), 
          soLuong: quantity            // Số lượng lấy theo state tùy chọn của người dùng
        };

      // Gọi service để lưu bản ghi mới xuống database Backend
      await gioHangService.save(cartPayload);

      // Kích hoạt cập nhật số giỏ hàng trên Header ngay tại thời điểm thực thi
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('cartUpdate'));
      }

      alert(t('common.messages.addProductSuccess'));
    } catch (error) {
      console.error("Lỗi khi thêm giỏ hàng từ chi tiết sản phẩm:", error);
      alert(t('products.messages.addError'));
    }
  };

  const isOutOfStockLimit = quantity >= product.quantity;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link href="/" className="text-orange-600 hover:text-orange-700">{t('productDetail.home')}</Link>
            <span>/</span>
            <Link href="/products" className="text-orange-600 hover:text-orange-700">{t('common.nav.products')}</Link>
            <span>/</span>
            <span className="text-gray-600">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center overflow-hidden border">
                {product.urlImg ? (
                  <img 
                    src={product.urlImg} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4" // object-contain giúp ảnh không bị cắt
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-4">
                  {product.shelf}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-600">{product.rating} / 5</span>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-lg mb-4">{product.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {t('productDetail.stock')}{' '}
                  <span className={product.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {product.quantity > 0 ? t('productDetail.stockCount', { count: product.quantity }) : t('productDetail.outOfStock')}
                  </span>
                </p>
              </div>

              <div className="text-4xl font-bold text-orange-600 mb-8">
                {(product.price * 1000).toLocaleString(t('common.currency.locale'))}{t('common.currency.suffix')}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      −
                    </button>
                    <span className="px-6 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => {
                        if (!isOutOfStockLimit) {
                          setQuantity(quantity + 1);
                        }
                      }}
                      className={`px-4 py-2 text-gray-600 hover:text-gray-900 ${isOutOfStockLimit ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={isOutOfStockLimit}
                    >
                      +
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className={`flex-1 text-white font-semibold py-3 flex items-center justify-center gap-2 transition-colors ${
                      isOutOfStockLimit 
                        ? 'bg-orange-300 cursor-not-allowed hover:bg-orange-300' 
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                    disabled={isOutOfStockLimit}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('common.actions.addToCart')}
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className={`flex-1 flex items-center justify-center transition-all duration-300 gap-2 ${
                      isLiked ? 'text-red-500 border-red-500' : ''
                    }`}
                    onClick={handleToggleLike}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />

                    <span>
                      {likeCount} {t('productDetail.favorite')}
                    </span>
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" /> {t('productDetail.share')}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('productDetail.productCode')}</span>
                  <span className="font-semibold text-gray-900">{product.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('productDetail.type')}</span>
                  <span className="font-semibold text-gray-900">{product.shelf}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('productDetail.related')}</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <Link key={rel.id} href={`/products/${rel.id}`}>
                    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                      <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                        {rel.urlImg ? (
                          <img 
                            src={rel.urlImg} 
                            alt={rel.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {rel.name}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-orange-600">
                            {rel.price}K
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{rel.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
