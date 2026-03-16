"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { authService } from "@/services/authService";
import { User, CreateUserPayload, UpdateUserPayload } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  type FormValues = {
    nama: string;
    email: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authService.getUsers({
        q: search,
        pageSize: PAGE_SIZE,
        pageNumber: page,
        sortBy: "createdAt",
        sortType: "DESC",
      });
      if (res.data) {
        setUsers((res.data as unknown as { data: User[]; total: number }).data ?? []);
        setTotal((res.data as unknown as { total: number }).total ?? 0);
      }
    } catch {
      toast.error("Gagal memuat data user");
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const openCreate = () => {
    setEditUser(null);
    reset({ nama: "", email: "", password: "" });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    reset({ nama: user.nama, email: user.email, password: "" });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      if (editUser) {
        const payload: UpdateUserPayload = {
          id: editUser.id,
          nama: data.nama,
          email: data.email,
          ...(data.password ? { password: data.password } : {}),
        };
        await authService.updateUser(payload);
        toast.success("User berhasil diperbarui");
      } else {
        const payload: CreateUserPayload = {
          nama: data.nama,
          email: data.email,
          password: data.password,
        };
        await authService.createUser(payload);
        toast.success("User berhasil ditambahkan");
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await authService.deleteUser(deleteId);
      toast.success("User berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus user");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Kelola akun admin yang dapat mengakses CMS"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            Tambah User
          </button>
        }
      />

      {/* Search & Filter */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari user berdasarkan nama atau email..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={32} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="Belum ada user" description="Tambahkan user admin baru" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-indigo-600">
                              {user.nama?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {user.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-400 font-mono">{user.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(user.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)} dari {total} user
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editUser ? "Edit User" : "Tambah User"}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              {...register("nama", { required: "Nama wajib diisi" })}
              className="input-field"
              placeholder="John Doe"
            />
            {errors.nama && (
              <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", { required: "Email wajib diisi" })}
              className="input-field"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password{" "}
              {editUser && (
                <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>
              )}
              {!editUser && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              {...register("password", {
                required: editUser ? false : "Password wajib diisi",
              })}
              className="input-field"
              placeholder={editUser ? "••••••••" : "Masukkan password"}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? "Menyimpan..." : editUser ? "Simpan" : "Tambahkan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus User"
        message="Apakah kamu yakin ingin menghapus user ini?"
      />
    </div>
  );
}
