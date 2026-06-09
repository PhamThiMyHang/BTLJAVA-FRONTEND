'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowUpDown, Search, CalendarDays } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { useTranslation } from 'react-i18next';

import { donHangService } from '@/services/donHangService';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


type DonHang = {
  maDH: string;
  tenKH: string;
  tenNV: string;
  ngayTao: string;
  tongTien: number;
  trangThai: string;
};

type SortField = 'maDH' | 'tenKH' | 'tenNV' | 'ngayTao' | 'tongTien';

export default function DonHangManagementPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [donHangs, setDonHangs] = useState<DonHang[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [sortField, setSortField] = useState<SortField>('ngayTao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // check admin
  useEffect(() => {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  // fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await donHangService.getAllDonHang();
        const rawData = res.data?.data ?? res.data ?? [];


       const mapped = rawData.map((item: any) =>  ({
          maDH: item.maDH,
          tenKH: item.tenKH,
          tenNV: item.tenNV,
          ngayTao: item.ngayTao,
          tongTien: item.tongTien,
          trangThai: item.trangThai,
        }));

        setDonHangs(mapped);
      } catch (err) {
        console.error('Lỗi load đơn hàng:', err);
      }
    };

    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // filter + sort
  const filtered = useMemo(() => {
    const result = donHangs.filter((item) => {
      const keyword = search.toLowerCase();

      const matchKeyword =
        item.maDH.toLowerCase().includes(keyword) ||
        item.tenKH.toLowerCase().includes(keyword) ||
        item.tenNV.toLowerCase().includes(keyword);

      const date = new Date(item.ngayTao);

      const matchStatus =
        statusFilter === 'ALL' || item.trangThai === statusFilter;

      const matchFrom = !fromDate || date >= fromDate;

      const matchTo =
        !toDate ||
        date <= new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59);

      return matchKeyword && matchStatus && matchFrom && matchTo;
    });

    result.sort((a, b) => {
      if (sortField === 'tongTien') {
        return sortOrder === 'asc'
          ? a.tongTien - b.tongTien
          : b.tongTien - a.tongTien;
      }

      if (sortField === 'ngayTao') {
        return sortOrder === 'asc'
          ? new Date(a.ngayTao).getTime() - new Date(b.ngayTao).getTime()
          : new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime();
      }

      return sortOrder === 'asc'
        ? (a as any)[sortField].localeCompare((b as any)[sortField])
        : (b as any)[sortField].localeCompare((a as any)[sortField]);
    });

    return result;
  }, [donHangs, search, statusFilter, fromDate, toDate, sortField, sortOrder]);

  const formatMoney = (value: number) =>
    value.toLocaleString('vi-VN') + ' đ';

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('vi-VN');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'DONE':
        return 'bg-green-100 text-green-700';
      case 'CANCEL':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'DONE':
        return 'Hoàn thành';
      case 'CANCEL':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Title */}
        <div className="bg-white border-b px-6 py-6">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto p-6 bg-white mt-6 rounded-xl border flex flex-wrap gap-4">

          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Tìm mã DH, KH, NV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status */}
          <select
             className="px-4 py-2 pr-10
                     border border-black-300 rounded-lg hover:border-orange-300 focus:bg-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="DONE">Hoàn thành</option>
            <option value="CANCEL">Đã hủy</option>
          </select>

          {/* From date */}
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <button
                    className={`
                      flex items-center gap-2
                      px-4 py-2
                      rounded-lg
                      min-w-[180px]
                      transition-all
                      bg-white border border-b

                      hover:border-orange-500
                      ${
                        fromOpen
                          ? "bg-orange-500 text-white border-orange-500"
                          : ""
                      }
                    `}
                  >
                <CalendarDays 
                        className={`w-4 h-4 ${
                        fromOpen ? "text-white" : "text-orange-500"
                      }`}
                    />

                    {fromDate
                      ? fromDate.toLocaleDateString("vi-VN")
                      : "Từ ngày"}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0  bg-orange-100">
              <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    classNames={{
                      day:
                        "h-9 w-9 rounded-md border border-transparent hover:border-orange-500 [&[data-selected]]:!bg-orange-500 [&[data-selected]]:!text-white",
                      day_selected:
                        "!bg-orange-500 !text-white hover:!bg-orange-500 hover:!text-white",
                      day_today:
                        "border border-orange-300 text-orange-600",

                      caption_label:
                        "text-orange-500 font-semibold",

                      nav_button:
                        "text-orange-500 hover:bg-orange-100",
                    }}
                  />
            </PopoverContent>
          </Popover>

          {/* To date */}
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <button
                    className={`
                      flex items-center gap-2
                      px-4 py-2
                      rounded-lg
                      min-w-[180px]
                      transition-all
                      bg-white border border-b

                      hover:border-orange-500
                     ${
                        toOpen
                          ? "bg-orange-500 text-white border-orange-500"
                          : ""
                      }
                    `}
                  >
                    <CalendarDays 
                     className={`w-4 h-4 ${
                        toOpen  ? "text-white" : "text-orange-500"
                      }`}
                    />

                    {toDate
                      ? toDate.toLocaleDateString("vi-VN")
                      : "Đến ngày"}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 bg-orange-100">
              <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                   classNames={{
                      day:
                        "h-9 w-9 rounded-md border border-transparent hover:border-orange-500 [&[data-selected]]:!bg-orange-500 [&[data-selected]]:!text-white",
                      day_selected:
                        "!bg-orange-500 !text-white hover:!bg-orange-500 hover:!text-white",
                      day_today:
                        "border border-orange-300 text-orange-600",

                      caption_label:
                        "text-orange-500 font-semibold",

                      nav_button:
                        "text-orange-500 hover:bg-orange-100",
                    }}
                  />
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto mt-6 bg-white rounded-xl border overflow-x-auto">

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">STT</th>

                <th onClick={() => handleSort('maDH')} className="p-4 cursor-pointer">
                  Mã DH <ArrowUpDown className="inline w-4 h-4" />
                </th>

                <th onClick={() => handleSort('tenKH')} className="p-4 cursor-pointer">
                  Khách hàng <ArrowUpDown className="inline w-4 h-4" />
                </th>

                <th onClick={() => handleSort('ngayTao')} className="p-4 cursor-pointer">
                  Ngày tạo <ArrowUpDown className="inline w-4 h-4" />
                </th>

                <th className="p-4">Nhân viên</th>

                <th onClick={() => handleSort('tongTien')} className="p-4 cursor-pointer">
                  Tổng tiền <ArrowUpDown className="inline w-4 h-4" />
                </th>

                <th className="p-4 text-center">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <tr key={item.maDH} className="border-t hover:bg-gray-50">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{item.maDH}</td>
                    <td className="p-4">{item.tenKH}</td>
                    <td className="p-4">{formatDate(item.ngayTao)}</td>
                    <td className="p-4">{item.tenNV}</td>
                    <td className="p-4">{formatMoney(item.tongTien)}</td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(item.trangThai)}`}>
                        {getStatusText(item.trangThai)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-10 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </main>

      <Footer />
    </div>
  );
}