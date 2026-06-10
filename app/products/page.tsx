'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sanPhamService } from '@/services/sanPhamService';
import { gioHangService } from '@/services/gioHangService'; // Import gioHangService
import { isAuthenticated, getCurrentUser } from '@/lib/auth'; // Import getCurrentUser
import { useTranslation } from 'react-i18next';

export default function ProductsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách sản phẩm thông qua Service
  useEffect(() => {
    sanPhamService.getAllSanPham()
      .then(response => {
        const responseData = response.data;
        const rawData = responseData?.data || responseData;

        if (Array.isArray(rawData)) {
          const mapped = rawData.map((item: any) => ({
            id: item.maSP,
            name: item.tenSP,
            price: item.gia,
            quantity: item.soLuong,

            maViTri: item.viTri,
            tenViTri: item.tenViTri,

            urlImg: item.urlImg,
            rating: 4.5
          }));
          console.log(mapped);
          setProducts(mapped);
          setFilteredProducts(mapped);
        }
      })
      .catch(err => console.error("Lỗi khi kết nối hệ thống tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
  ...new Map(
    products.map((p: any) => [
      p.maViTri,
      {
        maViTri: p.maViTri,
        tenViTri: p.tenViTri
      }
    ])
  ).values()
];


  // Lọc theo danh mục + tìm kiếm
  useEffect(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(
        (p: any) => p.maViTri === selectedCategory
      );
    }

    if (searchTerm.trim() !== "") {
      result = result.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  // Xử lý gửi dữ liệu thêm vào giỏ hàng xuống API Backend
  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated()) {
      alert(t('common.messages.loginRequired'));
      router.push('/login'); 
      return;
    }

    const user = getCurrentUser() as any;

    if (user?.role?.toLowerCase() === 'admin') {
      alert(t('products.messages.adminNotAllowed'));
      return;
    }

    try {
      // Lấy thông tin user đang đăng nhập
      if (!user || !user.userID) {
        alert(t('products.messages.missingUser'));
        return;
      }

      // Xây dựng cấu trúc Object khớp với Backend yêu cầu
      const cartPayload = {
      maGioHang: null,            // Có thể truyền null hoặc bỏ trống khi thêm mới
      maUser: String(user.userID), // Khớp với @NotBlank private String maUser;
      maSP: String(productId),    // Khớp với @NotBlank private String maSP;
      soLuong: 1                  // Mặc định là 1 sản phẩm
    };

      // Gửi dữ liệu xuống API Backend thông qua gioHangService
      await gioHangService.save(cartPayload);
      
      // Đồng bộ số hiển thị giỏ hàng trên Header ngay lập tức
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('cartUpdate'));
      }
      alert(t('common.messages.addProductSuccess'));
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      alert(t('products.messages.addError'));
    }
  };

  

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gray-50 py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('products.title')}</h1>
            <p className="text-gray-600 text-lg">
              {t('products.description')}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-700" />
                  <h2 className="font-semibold text-gray-900">{t('products.category')}</h2>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                      selectedCategory === null
                        ? 'bg-orange-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('products.all')}
                  </button>
                  {categories.map((category: any) => (
                    <button
                      key={category.maViTri}
                      onClick={() => setSelectedCategory(category.maViTri)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                        selectedCategory === category.maViTri
                          ? 'bg-orange-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.tenViTri}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {loading ? (
                <div className="text-center py-12 text-gray-500">{t('common.loading.products')}</div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product: any) => (
                      <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                        <Link href={`/products/${product.id}`} className="flex-1 flex flex-col group">
                          <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400 text-4xl select-none">
                            {product.urlImg ? (
                              <img 
                                src={product.urlImg || '/default-product.png'} 
                                onError={(e) => { e.currentTarget.src = '/default-product.png'; }}
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-gray-400 text-4xl">📦</span>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition">
                              {product.name}
                            </h3>
                            <p className="text-xs text-orange-600 mb-2">
                              {product.tenViTri}
                            </p>
                            <p className="text-sm text-gray-600 mb-3 flex-1">
                              {t('products.stock', { count: product.quantity })}
                            </p>
                          </div>
                        </Link>

                        <div className="p-4 pt-0">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-bold text-orange-600">
                              {product.price} VNĐ
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                          </div>
                          
                          <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleAddToCart(product.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {t('common.actions.addCart')}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-gray-500">{t('products.empty')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
