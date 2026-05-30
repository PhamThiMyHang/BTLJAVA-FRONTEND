"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

// Import các hàm gọi API 
import { petService } from '@/services/petService';         
import { khachHangService } from '@/services/khachHangService'; 
import { nhanVienService } from '@/services/nhanVienService';   

export default function AboutPage() {
  const { t } = useTranslation();
  
  // Quản lý trạng thái các con số thống kê
  const [stats, setStats] = useState({
    totalPets: 0,
    totalCages: 0,
    totalCustomers: 0,
    totalStaff: 0
  });

  // Quản lý mảng danh sách nhân viên để hiển thị thẻ (Card)
  const [teamMembers, setTeamMembers] = useState<{id: number; tenNV?: string; chucVu?: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // Chạy song song 5 API (3 API summary cũ + 2 API nhân viên mới)
        const [petRes, chuongRes, khRes, nvListRes, nvSummaryRes] = await Promise.all([
          petService.getPetSummary(),        
          petService.getChuongSummary(),     
          khachHangService.getKhachHangSummary(), 
          nhanVienService.getAllNhanVien(),     // GET /api/nhan-vien
          nhanVienService.getNhanVienSummary()  // GET /api/nhan-vien/summary
        ]);

        // 1. Đổ dữ liệu vào các con số thống kê
        setStats({
          totalPets: petRes?.data?.data?.tongSoLuongPet || 0, 
          totalCages: chuongRes?.data?.data?.tongSoChuong || 0,
          totalCustomers: khRes?.data?.data?.tongSoKhachHang || 0,
          // Bóc tách chính xác thuộc tính tongSoNhanVien từ Object thống kê của bạn
          totalStaff: nvSummaryRes?.data?.data?.tongSoNhanVien || 0 
        });

        // 2. Bóc tách mảng nhân viên từ API danh sách
        const staffList = nvListRes?.data || [];
        
        if (Array.isArray(staffList)) {
          // Lấy tối đa 4 nhân viên đầu tiên để hiển thị giao diện mẫu cho đẹp
          const mapped = staffList.map((nv: any) => ({
              id: nv.maNV ,
              tenNV: nv.tenNV,
              chucVu: nv.chucVu
            }));

            setTeamMembers(mapped.slice(0, 8));

        } else {
          console.warn("Dữ liệu /api/nhan-vien trả về không phải là mảng:", staffList);
          setTeamMembers([]);
        }

      } catch (error) {
        console.error("Lỗi khi kết nối API trang About:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchAboutData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Banner Header */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('about.title')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('about.description')}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center text-6xl overflow-hidden 0">
             
                <img 
                  src="\pet-banner.png" 
                  alt={t('about.imageAlt')}
                  className="h-64 w-auto object-contain rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.storyTitle')}</h2>
                <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                  {t('about.storyText')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section - Hiển thị danh sách nhân sự thực tế */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              {t('about.teamTitle')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              {loading ? (
                <div className="col-span-4 text-center text-gray-500 py-4">{t('about.teamLoading')}</div>
              ) : teamMembers.length > 0 ? (
                teamMembers.map((member, index) => (
                  <Link
                key={index}
                href={`/about/about-nhanvien/${member.id}`}
                className="text-center bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >

                    <div className="text-6xl mb-4">
                      {/* Đọc thuộc tính chucVu từ API của bạn để hiển thị đúng Icon */}
                      {member?.chucVu === 'ADMIN' ? '👨‍💼' : member?.chucVu === 'KTV' ? '👩‍⚕️' : '👩‍💼'}
                    </div>
                    {/* Hiển thị chính xác tên nhân viên (tenNV) và chức vụ (chucVu) */}
                    <h3 className="text-lg font-semibold text-gray-900">{member?.tenNV || t('common.fallbacks.unknownName')}</h3>
                    <p className="text-orange-600 text-sm font-medium mt-1">{member?.chucVu || t('common.fallbacks.unknownRole')}</p>
                  </Link>
                ))
              ) : (
                <div className="col-span-4 text-center text-gray-500 py-4">{t('about.teamEmpty')}</div>
              )}

            </div>
          </div>
        </section>

        {/* Stats Section - Hiển thị các con số thống kê động */}
        <section className="bg-orange-600 text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {loading ? '...' : `${stats.totalCustomers}+`}
                </div>
                <p className="text-orange-100">{t('about.stats.customers')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {loading ? '...' : stats.totalPets}
                </div>
                <p className="text-orange-100">{t('about.stats.pets')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {loading ? '...' : stats.totalCages}
                </div>
                <p className="text-orange-100">{t('about.stats.cages')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {/* Hiển thị con số 12 lấy từ API Summary */}
                  {loading ? '...' : stats.totalStaff}
                </div>
                <p className="text-orange-100">{t('about.stats.staff')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.ctaTitle')}
            </h2>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-orange-600 hover:bg-orange-700 px-8">
                  {t('about.goDashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
