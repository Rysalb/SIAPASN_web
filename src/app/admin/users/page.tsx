'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Search,
  Trash2,
  UserPlus,
  AlertTriangle,
  Key,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import { LoadingState } from '@/components/ui/UIStates';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Add user modal state
  const [addModal, setAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    province: '',
    phone: '',
    educationLevel: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
      if (data.currentAdmin) {
        setCurrentAdmin(data.currentAdmin);
      }
    } catch (e) {
      console.error(e);
      showAlert('error', 'Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', 'Status akun berhasil diperbarui.');
        fetchUsers();
      } else {
        showAlert('error', data.error || 'Gagal mengubah status.');
      }
    } catch (e) {
      showAlert('error', 'Terjadi kesalahan sistem.');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', 'Role pengguna berhasil diperbarui.');
        fetchUsers();
      } else {
        showAlert('error', data.error || 'Gagal mengubah role.');
      }
    } catch (e) {
      showAlert('error', 'Terjadi kesalahan sistem.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteModal.user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', data.message || 'Akun pengguna berhasil dihapus.');
        setDeleteModal({ open: false, user: null });
        fetchUsers();
      } else {
        showAlert('error', data.error || 'Gagal menghapus pengguna.');
      }
    } catch (e) {
      showAlert('error', 'Terjadi kesalahan saat menghapus pengguna.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan akun.');
      }

      showAlert('success', `Akun ${newUser.name} (${newUser.email}) berhasil ditambahkan.`);
      setAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        province: '',
        phone: '',
        educationLevel: '',
      });
      fetchUsers();
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  const filtered = users.filter((u) => {
    if (!search) return true;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm border ${
            alert.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            Manajemen Pengguna & Otoritas
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Kelola akun peserta, pengelola materi, dan hak akses sistem (RBAC).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setAddModal(true)}
              className="btn btn-primary text-xs font-bold px-3.5 py-2 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, role..."
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                      Tidak ada pengguna yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isSelf = currentAdmin?.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                                Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{u.email}</td>
                        <td className="py-3 px-4">
                          {isSuperAdmin && !isSelf ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.id, e.target.value)}
                              className="form-select text-[11px] py-1 px-2 w-auto font-semibold"
                            >
                              <option value="USER">USER (Peserta)</option>
                              <option value="ADMIN">ADMIN (Konten)</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-primary)]">
                              {u.role === 'SUPER_ADMIN' ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                              ) : u.role === 'ADMIN' ? (
                                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                              ) : (
                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              <span>{u.role}</span>
                            </span>
                          )}
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
                          <div className="flex items-center justify-center gap-2">
                            {/* Toggle Active Button */}
                            <button
                              disabled={isSelf}
                              onClick={() => handleToggleActive(u.id, u.isActive)}
                              title={isSelf ? 'Tidak dapat menonaktifkan akun sendiri' : undefined}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                                isSelf
                                  ? 'opacity-40 cursor-not-allowed text-[var(--text-muted)]'
                                  : u.isActive
                                  ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                            >
                              {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>

                            {/* Delete User Button (Super Admin Only) */}
                            {isSuperAdmin && (
                              <button
                                disabled={isSelf}
                                onClick={() => setDeleteModal({ open: true, user: u })}
                                title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus akun pengguna'}
                                className={`text-xs font-bold p-1.5 rounded-lg transition-all ${
                                  isSelf
                                    ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
                                    : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Pengguna Baru (Super Admin Only) */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    Tambah Pengguna Baru
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Hanya Super Administrator yang berhak membuat akun baru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-xs font-semibold flex items-center gap-2 border border-[var(--error)]/20">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Contoh: Rian Pratama"
                    className="form-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="form-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="form-input text-xs pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Hak Akses (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="form-select text-xs font-bold"
                  >
                    <option value="USER">USER (Peserta Tryout)</option>
                    <option value="ADMIN">ADMIN (Pengelola Konten Soal & Materi)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Akses Penuh Sistem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Provinsi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newUser.province}
                    onChange={(e) => setNewUser({ ...newUser, province: e.target.value })}
                    placeholder="Contoh: Jawa Timur"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    No. Handphone (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => setAddModal(false)}
                  className="btn btn-secondary text-xs font-semibold px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan & Buat Akun</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Akun Pengguna */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[var(--text-primary)]">
                Konfirmasi Hapus Akun
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Apakah Anda yakin ingin menghapus akun berikut secara permanen?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] space-y-1 text-xs">
              <div className="font-bold text-[var(--text-primary)]">
                {deleteModal.user.name}
              </div>
              <div className="text-[var(--text-muted)]">
                {deleteModal.user.email}
              </div>
              <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                Role: {deleteModal.user.role}
              </div>
            </div>

            <p className="text-[11px] text-red-600 dark:text-red-400 text-center font-medium">
              Perhatian: Tindakan ini akan menghapus seluruh data profil, riwayat ujian, dan progres belajar akun ini. Tindakan tidak dapat dibatalkan.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="btn btn-secondary text-xs font-semibold px-4 py-2"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="btn bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
