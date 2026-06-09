'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowUpDown, Search, Trash2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import { userService } from '@/services/userService';

type UserItem = {
  userID: number;
  username: string;
  gmail: string;
  status: string;
  roles: string[];
};

type SortField = 'userID' | 'username' | 'gmail' | 'status';

const ROLES = ['ADMIN', 'KTV', 'STAFF', 'CUSTOMER'];

export default function UserManagementPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<Record<string, UserItem[]>>({
    ADMIN: [],
    KTV: [],
    STAFF: [],
    CUSTOMER: [],
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [sortField, setSortField] = useState<SortField>('userID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ================= AUTH =================
  useEffect(() => {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  // ================= FETCH =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('USER SERVICE DEBUG:', userService);
        console.log('FUNCTIONS:', Object.keys(userService));

        const results = await Promise.all(
          ROLES.map((role) => userService.getUsersByRole(role))
        );

        const newData: any = {};

        ROLES.forEach((role, index) => {
          const res = results[index];

          // ✅ FIX CHUẨN 100%
          const raw = res?.data?.data ?? res?.data ?? [];

          newData[role] = Array.isArray(raw) ? raw : [];
        });

        console.log(Object.keys(userService));

        console.log('USER DATA:', newData);

        setUsers(newData);
      } catch (err) {
        console.error('Lỗi load user:', err);
      }
    };

    fetchUsers();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id: number, role: string) => {
    try {
      await userService.deleteUser(id);

      setUsers((prev) => ({
        ...prev,
        [role]: prev[role].filter((u) => u.userID !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SORT =================
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ================= FILTER + SORT =================
  const process = (list: UserItem[]) => {
    const filtered = list.filter((u) => {
      const matchSearch =
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.gmail?.toLowerCase().includes(search.toLowerCase()) ||
        String(u.userID).includes(search);

      const matchStatus =
        statusFilter === 'ALL' || u.status === statusFilter;

      return matchSearch && matchStatus;
    });

    filtered.sort((a: any, b: any) => {
      const A = a[sortField];
      const B = b[sortField];

      if (typeof A === 'number') {
        return sortOrder === 'asc' ? A - B : B - A;
      }

      return sortOrder === 'asc'
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    return filtered;
  };

  // ================= TABLE =================
  const renderTable = (role: string) => {
    const data = process(users[role]);

    return (
      <div className="bg-white border rounded-xl mb-6 overflow-hidden">
        <div className="px-5 py-3 bg-gray-100 font-bold">
          {role}
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">ID</th>

              <th
                className="p-3 cursor-pointer"
                onClick={() => handleSort('username')}
              >
                Username <ArrowUpDown className="inline w-4 h-4" />
              </th>

              <th
                className="p-3 cursor-pointer"
                onClick={() => handleSort('gmail')}
              >
                Gmail <ArrowUpDown className="inline w-4 h-4" />
              </th>

              <th className="p-3">Status</th>

              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((u) => (
                <tr key={u.userID} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.userID}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.gmail}</td>
                  <td className="p-3">{u.status}</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(u.userID, role)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-5 text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
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

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">

        {/* FILTER BAR (GIỐNG BOOKING STYLE) */}
        <div className="bg-white border rounded-xl p-5 mb-6 flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border px-4 py-2 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        {/* 4 TABLES */}
        {ROLES.map((role) => (
            <div key={role}>
                {renderTable(role)}
            </div>
            ))}

      </main>

      <Footer />
    </div>
  );
}