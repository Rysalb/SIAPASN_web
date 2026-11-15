'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, ShieldAlert, Check, X, Search } from 'lucide-react';
import { LoadingState } from '@/components/ui/UIStates';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            Manajemen Pengguna & Otoritas
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Kelola akun peserta, pengelola materi, dan hak akses sistem (RBAC).
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="form-input text-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Memuat pengguna..." />
      ) : (
        <div className="card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-base)] text-[var(--text-muted)] font-bold uppercase text-[10px] border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Ujian Diikuti</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--text-secondary)]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-card-hover)]">
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{u.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="form-select text-[11px] py-1 px-2 w-auto"
                      >
                        <option value="USER">USER (Peserta)</option>
                        <option value="ADMIN">ADMIN (Konten)</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">{u._count?.attempts || 0} Kali</td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="badge badge-success text-[10px]">Aktif</span>
                      ) : (
                        <span className="badge badge-error text-[10px]">Nonaktif</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                          u.isActive
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

