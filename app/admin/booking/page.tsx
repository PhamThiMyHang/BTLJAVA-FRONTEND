'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowUpDown, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { useTranslation } from 'react-i18next';
import { lichHenService } from '@/services/lichHenService';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";

type Booking = {
  maLich: string;
  tenKH: string;
  tenPet: string;
  tenDV: string;
  tenNV: string;
  thoiGian: string;
  trangThai: string;
};

type SortField =
  | 'tenKH'
  | 'tenPet'
  | 'tenNV'
  | 'thoiGian';

export default function BookingManagementPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [sortField, setSortField] =
    useState<SortField>('thoiGian');

  const [sortOrder, setSortOrder] =
    useState<'asc' | 'desc'>('desc');

  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Kiểm tra quyền admin
  useEffect(() => {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  // Fetch API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await lichHenService.getAllLichHen();

        setBookings(res.data);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu lịch hẹn:', error);
      }
    };

    fetchBookings();
  }, []);

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter + Sort
  const filteredBookings = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      const keyword = search.toLowerCase();

      const matchKeyword =
        booking.tenKH.toLowerCase().includes(keyword) ||
        booking.tenPet.toLowerCase().includes(keyword) ||
        booking.tenNV.toLowerCase().includes(keyword) ||
        booking.tenDV.toLowerCase().includes(keyword);

      const bookingDate = new Date(booking.thoiGian);

      const matchStatus =
        statusFilter === 'ALL' ||
        booking.trangThai === statusFilter;

      const matchFromDate =
        !fromDate || bookingDate >= fromDate;

      const matchToDate =
        !toDate ||
        bookingDate <= new Date(
          toDate.getFullYear(),
          toDate.getMonth(),
          toDate.getDate(),
          23,
          59,
          59
        );
      return (
        matchKeyword &&
        matchStatus &&
        matchFromDate &&
        matchToDate
      );

      return matchKeyword && matchStatus;
    });

    filtered.sort((a, b) => {
      if (sortField === 'thoiGian') {
        const timeA = new Date(a.thoiGian).getTime();
        const timeB = new Date(b.thoiGian).getTime();

        return sortOrder === 'asc'
          ? timeA - timeB
          : timeB - timeA;
      }

      const valueA = a[sortField].toLowerCase();
      const valueB = b[sortField].toLowerCase();

      return sortOrder === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    return filtered;
  }, [bookings, search, statusFilter, fromDate, toDate, sortField, sortOrder]);

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString(t('common.currency.locale'), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';

      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';

      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700';

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
        return 'Chờ xác nhận';

      case 'CONFIRMED':
        return 'Đã xác nhận';

      case 'IN_PROGRESS':
        return 'Đang thực hiện';

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
        {t('common.loading.default')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.adminBooking.title')}
            </h1>

            <p className="text-gray-600 mt-2">
              {t('dashboard.adminBooking.subtitle')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search */}
          <div className="bg-white border rounded-xl p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                <input
                  type="text"
                  placeholder={t('dashboard.adminBooking.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

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

              <Popover open={toOpen} onOpenChange={setToOpen} >
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 pr-10
                     border border-black-300 rounded-lg hover:border-orange-300 focus:bg-orange-100"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="DONE">Hoàn thành</option>
                <option value="CANCEL">Đã hủy</option>
              </select>

            </div>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr className="text-sm text-gray-700">
                    <th className="px-5 py-4 text-left font-semibold">
                      STT
                    </th>

                    {/* Customer */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('tenKH')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('common.fields.customer')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Pet */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('tenPet')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('dashboard.adminBooking.petName')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Service */}
                    <th className="px-5 py-4 text-left font-semibold">
                      {t('common.fields.service')}
                    </th>

                    {/* Staff */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('tenNV')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('dashboard.adminBooking.assignedStaff')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Time */}
                    <th className="px-5 py-4 text-left">
                      <button
                        onClick={() =>
                          handleSort('thoiGian')
                        }
                        className="flex items-center gap-1 font-semibold hover:text-orange-600"
                      >
                        {t('dashboard.adminBooking.time')}
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>

                    {/* Status */}
                    <th className="px-5 py-4 text-center font-semibold">
                      {t('common.fields.status')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <tr
                        key={booking.maLich}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-4 font-medium">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          {booking.tenKH}
                        </td>

                        <td className="px-5 py-4">
                          {booking.tenPet}
                        </td>

                        <td className="px-5 py-4">
                          {booking.tenDV}
                        </td>

                        <td className="px-5 py-4">
                          {booking.tenNV}
                        </td>

                        <td className="px-5 py-4">
                          {formatDateTime(
                            booking.thoiGian
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                              booking.trangThai
                            )}`}
                          >
                            {getStatusText(
                              booking.trangThai
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-gray-500"
                      >
                        {t('dashboard.adminBooking.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
