'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { dichVuService } from '@/services/dichVuService';
import { useTranslation } from 'react-i18next';
import { ServiceImage } from '@/components/ServiceImage';
import { useState, useEffect, useRef, useCallback } from 'react';

import { Filter, ArrowRight, Search, X } from 'lucide-react';

// === HÀM FORMAT GIÁ ĐÃ SỬA ===
const formatPrice = (gia: number | string, locale: string): string => {
  const num = Number(gia || 0);
  
  return Math.round(num).toLocaleString(locale) + ' VNĐ';
};



// Hàm tự động phân loại dịch vụ dựa trên tên
const getCategoryFromName = (tenDV: string): string => {
  if (!tenDV) return 'Grooming';

  const name = tenDV.toLowerCase().trim();

  if (name.includes('cắt') || name.includes('trim') || name.includes('tắm') || 
      name.includes('groom') || name.includes('lông') || name.includes('tiện')) {
    return 'Grooming';
  }
  if (name.includes('spa') || name.includes('thư giãn') || name.includes('massage') || 
      name.includes('tắm dưỡng') || name.includes('xông')) {
    return 'Spa';
  }
  if (name.includes('khách sạn') || name.includes('hotel') || name.includes('nghỉ') || 
      name.includes('ở') || name.includes('boarding')) {
    return 'Hotel';
  }
  if (name.includes('khám') || name.includes('tiêm') || name.includes('thuốc') || 
      name.includes('sức khỏe') || name.includes('chữa') || name.includes('vet') || 
      name.includes('bệnh')) {
    return 'Healthcare';
  }
  if (name.includes('huấn luyện') || name.includes('train') || name.includes('dạy') || 
      name.includes('ngồi') || name.includes('kỹ năng')) {
    return 'Training';
  }

  return 'Grooming';
};

const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-200 text-black rounded px-1"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

// Khoảng giá lọc (đơn vị: K = nghìn VNĐ)
const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: 0, max: 999999999 },
  { label: 'Dưới 200K', min: 0, max: 200000 },
  { label: '200K – 500K', min: 200000, max: 500000 },
  { label: '500K – 1 triệu', min: 500000, max: 1000000 },
  { label: 'Trên 1 triệu', min: 1000000, max: 999999999 },
];

export default function ServicesPage() {
  const { t } = useTranslation();

  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TatCa');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // index vào PRICE_RANGES
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
  return () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };
}, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dichVuService.getAllDichVu();
        const list = Array.isArray(data) ? data : data?.data || [];

        const processed = list.map((service: any) => ({
          ...service,
          category: service.category || getCategoryFromName(service.tenDV || '')
        }));
        console.log('processed services =', processed);

        setServices(processed);
        setFilteredServices(processed);
      } catch (err: any) {
        setError(t('servicesPage.loadError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ─── Gọi backend search khi keyword/giá thay đổi ───────
  const fetchSearch = useCallback(async (keyword: string, priceIdx: number, category: string) => {
    const range = PRICE_RANGES[priceIdx];
    const hasKeyword = keyword.trim().length > 0;
    const hasPriceFilter = priceIdx !== 0;

    // Nếu không có keyword và không lọc giá → dùng local filter (nhanh hơn)
    if (!hasKeyword && !hasPriceFilter) {
      const result = category === 'TatCa'
        ? services
        : services.filter(s => s.category === category);
      setFilteredServices(result);
      return;
    }

    try {
      setSearching(true);
      let list: any[] = [];

      if (hasKeyword) {
        // Dùng endpoint /search của backend
        const res = await dichVuService.searchDichVu({
          keyword: keyword.trim(),
          giaMin: hasPriceFilter ? range.min : undefined,
          giaMax: hasPriceFilter ? range.max : undefined,
          size: 100,
        });
        const raw = res.data;
        list = Array.isArray(raw)
          ? raw
          : raw?.content || raw?.data || [];
      } else {
        // Chỉ lọc giá → dùng endpoint /gia-range
        const res = await dichVuService.getByGiaRange(range.min, range.max);
        const raw = res.data;
        list = Array.isArray(raw) ? raw : raw?.data || [];
      }

      // Bổ sung category nếu backend không trả về
      const processed = list.map((s: any) => ({
        ...s,
        category: s.category || getCategoryFromName(s.tenDV || ''),
      }));

      // Lọc thêm theo danh mục phía client
      const filtered = category === 'TatCa'
        ? processed
        : processed.filter((s: any) => s.category === category);

      setFilteredServices(filtered);
    } catch (err) {
      console.error('Search error:', err);
      // Fallback về local filter nếu backend lỗi
      const local = services.filter(s => {
        const matchKeyword = !keyword || s.tenDV?.toLowerCase().includes(keyword.toLowerCase()) ||
          s.moTa?.toLowerCase().includes(keyword.toLowerCase());
        const range = PRICE_RANGES[priceIdx];
        const price = Number(s.gia || 0);
        const matchPrice = priceIdx === 0 || (price >= range.min && price <= range.max);
        const matchCat = category === 'TatCa' || s.category === category;
        return matchKeyword && matchPrice && matchCat;
      });
      setFilteredServices(local);
    } finally {
      setSearching(false);
    }
  }, [services]);

  // ─── Debounce khi input thay đổi ───────────────────────
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(val);
    }, 400);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setSearchKeyword('');
  };

  useEffect(() => {
  if (!loading) {
    fetchSearch(searchKeyword, selectedPriceRange, selectedCategory);
  }
}, [
  searchKeyword,
  selectedPriceRange,
  selectedCategory,
  loading,
  fetchSearch,
]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">{t('common.loading.services')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">


        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20 border-b">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{t('servicesPage.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('servicesPage.description')}
            </p>

            {/* ── THANH TÌM KIẾM ── */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Tìm kiếm dịch vụ theo tên hoặc mô tả..."
                  className="w-full pl-12 pr-12 py-4 text-base rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
                {inputValue && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* ── SIDEBAR LỌC ── */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-24 shadow-sm space-y-8">

                {/* Danh mục */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Filter className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-semibold text-gray-900">{t('servicesPage.category')}</h2>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('TatCa')}
                      className={`w-full text-left px-5 py-3 rounded-2xl font-medium transition-all text-sm ${
                        selectedCategory === 'TatCa' ? 'bg-orange-600 text-white shadow' : 'hover:bg-gray-100'
                      }`}
                    >
                      {t('servicesPage.categories.TatCa')}
                    </button>
                    {['Grooming', 'Spa', 'Hotel', 'Healthcare', 'Training'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-5 py-3 rounded-2xl font-medium transition-all text-sm ${
                          selectedCategory === cat ? 'bg-orange-600 text-white shadow' : 'hover:bg-gray-100'
                        }`}
                      >
                        {t(`servicesPage.categories.${cat}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lọc giá */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Mức giá</h2>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPriceRange(idx)}
                        className={`w-full text-left px-5 py-3 rounded-2xl font-medium transition-all text-sm ${
                          selectedPriceRange === idx ? 'bg-orange-600 text-white shadow' : 'hover:bg-gray-100'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset bộ lọc */}
                {(selectedCategory !== 'TatCa' || selectedPriceRange !== 0 || inputValue) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('TatCa');
                      setSelectedPriceRange(0);
                      handleClearSearch();
                    }}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* DANH SÁCH DỊCH VỤ */}
            <div className="lg:col-span-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-8">
                  {error}
                </div>
              )}



              {/* Kết quả đang tìm */}
              {(searchKeyword || selectedPriceRange !== 0) && !searching && (
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4" />
                  <span>
                    Tìm thấy <span className="font-semibold text-orange-600">{filteredServices.length}</span> dịch vụ
                    {searchKeyword && <> cho "<span className="font-semibold">{searchKeyword}</span>"</>}
                    {selectedPriceRange !== 0 && <> · {PRICE_RANGES[selectedPriceRange].label}</>}
                  </span>
                </div>
              )}

              {/* Skeleton loading khi đang search */}
              {searching ? (
                <div className="grid gap-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-gray-200 rounded-3xl p-8 animate-pulse">
                      <div className="grid md:grid-cols-12 gap-8">
                        <div className="md:col-span-4 h-64 bg-gray-100 rounded-2xl" />
                        <div className="md:col-span-8 space-y-4">
                          <div className="h-4 bg-gray-100 rounded w-1/4" />
                          <div className="h-8 bg-gray-100 rounded w-3/4" />
                          <div className="h-4 bg-gray-100 rounded w-full" />
                          <div className="h-4 bg-gray-100 rounded w-5/6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (


              <div className="grid gap-8">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (

                    <div
                      key={service.maDV}
                      className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="grid md:grid-cols-12 gap-8 p-8">
                        
                        <div className="md:col-span-4 relative h-64 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                          <ServiceImage service={service} />
                        </div>

                        <div className="md:col-span-8 flex flex-col justify-between">
                          <div>
                            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-3">
                              {t(`servicesPage.categories.${service.category}`, t('servicesPage.serviceFallback'))}
                            </span>

                            <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                                {/* Highlight từ khóa nếu đang tìm kiếm */}
                                {searchKeyword
                                  ? highlightText(service.tenDV, searchKeyword)
                                  : service.tenDV}
                            </h3>

                            <p className="text-gray-600 text-[17px] leading-relaxed mb-6">
                              {service.moTa}
                            </p>
                          </div>

                          <div className="flex items-end justify-between pt-6 border-t">
                            <div>
                              <span className="text-4xl font-bold text-orange-600">
                                {formatPrice(service.gia, t('common.currency.locale'))}
                              </span>
                            </div>

                            <Link href={`/services/${service.maDV}`}>
                              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-2xl flex items-center gap-3">
                                {t('common.actions.bookNow')}
                                <ArrowRight className="w-5 h-5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-2xl text-gray-500">
                        {searchKeyword
                          ? `Không tìm thấy dịch vụ nào cho "${searchKeyword}"`
                          : t('servicesPage.empty')}
                      </p>
                      {(searchKeyword || selectedPriceRange !== 0) && (
                        <button
                          onClick={() => { handleClearSearch(); setSelectedPriceRange(0); }}
                          className="mt-4 text-orange-600 hover:underline text-sm"
                        >
                          Xóa bộ lọc để xem tất cả
                        </button>
                      )}
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
