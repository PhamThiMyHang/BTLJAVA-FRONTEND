'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { dichVuService } from '@/services/dichVuService';

const categoryLabels: any = {
  'TatCa': 'Tất cả',
  'Grooming': 'Grooming & Chăm sóc lông',
  'Spa': 'Spa & Thư giãn',
  'Hotel': 'Khách sạn thú cưng',
  'Healthcare': 'Chăm sóc sức khỏe',
  'Training': 'Huấn luyện & Giáo dục',
};

// === HÀM FORMAT GIÁ ĐÃ SỬA ===
const formatPrice = (gia: number | string): string => {
  const num = Number(gia || 0);
  
  if (num === 0) return '0K';

  // Nếu giá nhỏ hơn 10.000 → coi là đã ở đơn vị nghìn (250 → 250K)
  if (num < 10000) {
    return Math.round(num) + 'K';
  }

  // Giá lớn (ví dụ: 1.200.000) → chia 1000
  return Math.round(num / 1000).toLocaleString('vi-VN') + 'K';
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

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TatCa');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dichVuService.getAllDichVu();
        const list = Array.isArray(data) ? data : data?.data || [];

        const processedServices = list.map((service: any) => ({
          ...service,
          category: service.category || getCategoryFromName(service.tenDV || '')
        }));

        setServices(processedServices);
        setFilteredServices(processedServices);
      } catch (err: any) {
        setError('Không thể tải danh sách dịch vụ.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'TatCa') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(s => s.category === selectedCategory));
    }
  }, [selectedCategory, services]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Đang tải dịch vụ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20 border-b">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Dịch vụ Thú Cưng</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những dịch vụ chuyên nghiệp và tận tâm nhất cho thú cưng của bạn
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* DANH MỤC */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-24 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Filter className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Danh mục</h2>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('TatCa')}
                    className={`w-full text-left px-6 py-4 rounded-2xl font-medium transition-all ${
                      selectedCategory === 'TatCa' ? 'bg-orange-600 text-white shadow' : 'hover:bg-gray-100'
                    }`}
                  >
                    Tất cả
                  </button>

                  {['Grooming', 'Spa', 'Hotel', 'Healthcare', 'Training'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-6 py-4 rounded-2xl font-medium transition-all ${
                        selectedCategory === cat ? 'bg-orange-600 text-white shadow' : 'hover:bg-gray-100'
                      }`}
                    >
                      {categoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DANH SÁCH DỊCH VỤ */}
            <div className="lg:col-span-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-8">
                  {error}
                </div>
              )}

              <div className="grid gap-8">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service.maDV}
                      className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="grid md:grid-cols-12 gap-8 p-8">
                        <div className="md:col-span-4 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl h-64 flex items-center justify-center text-8xl border border-orange-100">
                          {service.category === 'Grooming' && '✂️'}
                          {service.category === 'Spa' && '🛁'}
                          {service.category === 'Hotel' && '🏨'}
                          {service.category === 'Healthcare' && '💊'}
                          {service.category === 'Training' && '🎓'}
                          {!service.category && '🐾'}
                        </div>

                        <div className="md:col-span-8 flex flex-col justify-between">
                          <div>
                            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-3">
                              {categoryLabels[service.category] || 'Dịch vụ'}
                            </span>

                            <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                              {service.tenDV}
                            </h3>

                            <p className="text-gray-600 text-[17px] leading-relaxed mb-6">
                              {service.moTa}
                            </p>
                          </div>

                          <div className="flex items-end justify-between pt-6 border-t">
                            <div>
                              <span className="text-4xl font-bold text-orange-600">
                                {formatPrice(service.gia)}
                              </span>
                            </div>

                            <Link href={`/services/${service.maDV}`}>
                              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-2xl flex items-center gap-3">
                                Đặt ngay
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
                    <p className="text-2xl text-gray-500">Không tìm thấy dịch vụ nào trong danh mục này</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}