'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import Header from '@/components/header';
import Footer from '@/components/footer';

import { sanPhamService } from '@/services/sanPhamService';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';

import { Search } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";

type SanPham = {
  maSP: string;
  tenSP: string;
  maNCC: string
  tenNCC: string;
  gia: number;
  soLuong: number;
  hanSuDung: string;
  tenViTri: string;
};

export default function ProductManagementPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<SanPham[]>([]);

  const [search, setSearch] = useState('');
  const [filterExp, setFilterExp] = useState('ALL');
  const [filterStock, setFilterStock] = useState('ALL');

  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

   // ===== EDIT MODAL =====
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SanPham | null>(null);

  const [editForm, setEditForm] = useState({
    gia: 0,
    soLuong: 0,
    hanSuDung: null as Date | null,
  });

  // ===== AUTH ADMIN =====
  useEffect(() => {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  // ===== FETCH DATA =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await sanPhamService.getAllSanPham();
        setProducts(res.data.data || res.data);
      } catch (err) {
        console.error('Lỗi load sản phẩm:', err);
      }
    };

    fetchData();
  }, []);

  // ===== CHECK EXPIRED =====
  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  // ===== FILTER + SEARCH =====
  const filteredProducts = useMemo(() => {
    let list = [...products];

    const keyword = search.toLowerCase();

    list = list.filter((p) =>
      p.maSP.toLowerCase().includes(keyword) ||
      p.tenSP.toLowerCase().includes(keyword) ||
      p.tenNCC.toLowerCase().includes(keyword)
    );

    // hạn sử dụng
    if (filterExp === 'EXPIRED') {
      list = list.filter(p => isExpired(p.hanSuDung));
    }
    if (filterExp === 'VALID') {
      list = list.filter(p => !isExpired(p.hanSuDung));
    }

    // số lượng
    if (filterStock === 'IN') {
      list = list.filter(p => p.soLuong > 0);
    }
    if (filterStock === 'OUT') {
      list = list.filter(p => p.soLuong === 0);
    }

    // giá
    if (minPrice !== '') list = list.filter(p => p.gia >= Number(minPrice));
    if (maxPrice !== '') list = list.filter(p => p.gia <= Number(maxPrice));

    return list;
  }, [products, search, filterExp, filterStock, minPrice, maxPrice]);

  // ===== GROUP BY LOCATION =====
  const grouped = useMemo(() => {
    return filteredProducts.reduce((acc: Record<string, SanPham[]>, item) => {
      if (!acc[item.tenViTri]) acc[item.tenViTri] = [];
      acc[item.tenViTri].push(item);
      return acc;
    }, {});
  }, [filteredProducts]);

  
  // ================= EDIT =================
  const handleEdit = (sp: SanPham) => {
    setEditingProduct(sp);
    setEditForm({
      gia: sp.gia,
      soLuong: sp.soLuong,
      hanSuDung: sp.hanSuDung ? new Date(sp.hanSuDung) : null,
    });
    setEditOpen(true);
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      await sanPhamService.updateSanPham(editingProduct.maSP, {
        tenSP: editingProduct.tenSP,
        maNCC: editingProduct.maNCC,
        gia: editForm.gia,
        soLuong: editForm.soLuong,
        hanSuDung: editForm.hanSuDung
          ? editForm.hanSuDung.toISOString().split('T')[0]
          : null,
      });

      setProducts(prev =>
        prev.map(p =>
          p.maSP === editingProduct.maSP
            ? {
                ...p,
                gia: editForm.gia,
                soLuong: editForm.soLuong,
                hanSuDung: editForm.hanSuDung
                  ? editForm.hanSuDung.toISOString().split('T')[0]
                  : p.hanSuDung,
              }
            : p
        )
      );

      setEditOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };


  // ===== DELETE =====
  const handleDelete = async (maSP: string) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa sản phẩm này?');
    if (!confirmDelete) return;

    try {
      await sanPhamService.deleteSanPham(maSP);
      setProducts(prev => prev.filter(p => p.maSP !== maSP));
    } catch (err) {
      console.error('Xóa thất bại:', err);
    }
  };

  // ===== LOADING =====
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <Header />

      <main className="flex-1">

        {/* HEADER */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold">
              Quản lý sản phẩm
            </h1>
            <p className="text-gray-500 mt-2">
              Danh sách sản phẩm theo vị trí kho
            </p>
          </div>
        </section>

        {/* FILTER */}
        <section className="max-w-7xl mx-auto px-6 py-6">

          <div className="bg-white p-4 rounded-xl border mb-6 flex flex-wrap gap-4 items-center">

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Tìm mã, tên, NCC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Hạn sử dụng */}
            <select
              className="border px-3 py-2 rounded-lg"
              onChange={(e) => setFilterExp(e.target.value)}
            >
              <option value="ALL">Hạn sử dụng</option>
              <option value="VALID">Còn hạn</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>

            {/* Số lượng */}
            <select
              className="border px-3 py-2 rounded-lg"
              onChange={(e) => setFilterStock(e.target.value)}
            >
              <option value="ALL">Số lượng</option>
              <option value="IN">Còn hàng</option>
              <option value="OUT">Hết hàng</option>
            </select>

            {/* Giá */}
            <input
              type="number"
              placeholder="Giá từ"
              className="border px-3 py-2 rounded-lg w-32"
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
            />

            <input
              type="number"
              placeholder="Giá đến"
              className="border px-3 py-2 rounded-lg w-32"
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
            />

             <button
                onClick={() => router.push('/admin/san-pham/create')}
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                + Thêm
            </button>


          </div>

          {/* TABLE GROUP BY LOCATION */}
          {Object.keys(grouped).length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Không có sản phẩm
            </p>
          ) : (
            Object.entries(grouped).map(([viTri, items]) => (
              <div key={viTri} className="mb-10">

                {/* TITLE GROUP */}
                <h2 className="text-lg font-bold text-orange-600 mb-3">
                  📦 Vị trí: {viTri}
                </h2>

                {/* TABLE */}
                <div className="bg-white border rounded-xl overflow-hidden">

                  <table className="w-full text-sm">

                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Mã SP</th>
                        <th className="p-3 text-left">Tên SP</th>
                        <th className="p-3 text-left">Nhà cung cấp</th>
                        <th className="p-3 text-left">Giá</th>
                        <th className="p-3 text-left">Số lượng</th>
                        <th className="p-3 text-left">Hạn sử dụng</th>
                        <th className="p-3 text-center">Hành động</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((sp) => (
                        <tr key={sp.maSP} className="border-t hover:bg-gray-50">

                          <td className="p-3">{sp.maSP}</td>
                          <td className="p-3">{sp.tenSP}</td>
                          <td className="p-3">{sp.tenNCC}</td>

                          <td className="p-3">
                            {sp.gia.toLocaleString()} đ
                          </td>

                          <td className={`p-3 ${sp.soLuong === 0 ? 'text-red-500' : ''}`}>
                            {sp.soLuong}
                          </td>

                          <td className={`p-3 ${isExpired(sp.hanSuDung) ? 'text-red-500' : 'text-green-600'}`}>
                            {sp.hanSuDung}
                          </td>

                           <td className="flex gap-2">
                                <button
                                onClick={() => handleEdit(sp)}
                                className="text-blue-600"
                                >
                                Sửa
                                </button>

                                <button
                                onClick={() => handleDelete(sp.maSP)}
                                className="text-red-600"
                                >
                                Xóa
                                </button>
                            </td>


                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

              </div>
            ))
          )}

        </section>
        
        {/* MODAL EDIT */}
        {editOpen && editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

            <div className="bg-white p-6 w-[500px] rounded">

              <h2 className="text-lg font-bold mb-3">Sửa sản phẩm</h2>

              <input
                type="number"
                value={editForm.gia}
                onChange={e => setEditForm({ ...editForm, gia: Number(e.target.value) })}
                className="border p-2 w-full mb-2"
              />

              <input
                type="number"
                value={editForm.soLuong}
                onChange={e => setEditForm({ ...editForm, soLuong: Number(e.target.value) })}
                className="border p-2 w-full mb-2"
              />

              <Calendar
                mode="single"
                selected={editForm.hanSuDung || undefined}
                onSelect={d => setEditForm({ ...editForm, hanSuDung: d || null })}
              />

              <div className="flex justify-end gap-2 mt-4">

                <button onClick={() => setEditOpen(false)}>
                  Đóng
                </button>

                <button onClick={handleUpdate} className="bg-orange-500 text-white px-3 py-1">
                  Lưu
                </button>

              </div>

            </div>
          </div>
        )}
  
  
      </main>

      <Footer />
    </div>
  );
}