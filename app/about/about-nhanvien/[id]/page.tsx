"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { nhanVienService } from "@/services/nhanVienService";

export default function StaffDetailPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffId = Number(id);

        const [nvRes, hoSoRes] = await Promise.all([
          nhanVienService.getNhanVienById(staffId),
          nhanVienService.getHoSoByMaNV(staffId)
        ]);

        setStaff({
          ...nvRes?.data?.data,
          ...hoSoRes?.data?.data
        });

      } catch (error) {
        console.error("Lỗi khi tải nhân viên:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStaff();
  }, [id]);



  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thông Tin Nhân Viên
          </h1>
        </section><section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Về Cửa Hàng Thú Cưng
            </h1>
            <p className="text-gray-600 text-lg">
              Tìm hiểu về chúng tôi và hành trình chăm sóc thú cưng chuyên nghiệp
            </p>
          </div>
        </section>


        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
            ) : staff ? (
              <div className="flex flex-col md:flex-row items-center gap-12 p-12 justify-center md:justify-start">
                <div className="w-64 h-64 rounded-full border-4 border-orange-400 overflow-hidden shadow-lg flex-shrink-0">
                  <img
                    src={staff?.anhNV || "/pet-banner.png"}
                    alt={staff?.tenNV}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:w-[45%] w-full bg-white border-2 border-orange-400 rounded-3xl p-8 shadow-md shadow-[0_-10px_20px_rgba(255,165,0,0.4),0_0_15px_rgba(255,165,0,0.25)]">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {staff?.tenNV}
                  </h2>

                  <p className="text-orange-600 font-semibold mb-2">
                    {staff?.chucVu}
                  </p>

                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Trình độ:</span> {staff?.trinhDo}
                  </p>

                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Kinh nghiệm:</span> {staff?.kinhNghiem}
                  </p>

                  <p className="text-orange-600 font-semibold mt-4">
                    <span className="font-semibold">SĐT:</span> {staff?.sdt || "Không có"}
                  </p>

                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">Không có dữ liệu nhân viên.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
