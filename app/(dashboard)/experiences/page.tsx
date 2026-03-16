"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { experienceService } from "@/services/experienceService";
import { Experience, ExperiencePayload } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Briefcase, GraduationCap } from "lucide-react";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Experience | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExperiencePayload>();

  const isCurrent = watch("is_current");

  const fetchData = async () => {
    try {
      const res = await experienceService.getAll();
      setExperiences(res.data ?? []);
    } catch {
      toast.error("Gagal memuat data experience");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    reset({
      type: "work",
      title: "",
      organization: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      display_order: 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: Experience) => {
    setEditItem(item);
    reset({
      type: item.type,
      title: item.title,
      organization: item.organization,
      start_date: item.start_date?.split("T")[0] ?? "",
      end_date: item.end_date?.split("T")[0] ?? "",
      is_current: item.is_current,
      description: item.description,
      display_order: item.display_order,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ExperiencePayload) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        end_date: data.is_current ? null : data.end_date,
      };
      if (editItem) {
        await experienceService.update(editItem.id, payload);
        toast.success("Experience berhasil diperbarui");
      } else {
        await experienceService.create(payload);
        toast.success("Experience berhasil ditambahkan");
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan experience");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await experienceService.delete(deleteId);
      toast.success("Experience berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus experience");
    } finally {
      setIsDeleting(false);
    }
  };

  const workExp = experiences.filter((e) => e.type === "work");
  const eduExp = experiences.filter((e) => e.type === "edu");

  return (
    <div>
      <PageHeader
        title="Experiences"
        subtitle="Kelola riwayat pekerjaan dan pendidikan"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            Tambah Experience
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      ) : experiences.length === 0 ? (
        <EmptyState
          title="Belum ada experience"
          description="Tambahkan riwayat pekerjaan atau pendidikan kamu"
        />
      ) : (
        <div className="space-y-6">
          {/* Work */}
          {workExp.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={18} className="text-green-600" />
                <h2 className="font-semibold text-gray-800">Pengalaman Kerja</h2>
                <Badge variant="success">{workExp.length}</Badge>
              </div>
              <div className="space-y-3">
                {workExp.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    exp={exp}
                    onEdit={() => openEdit(exp)}
                    onDelete={() => setDeleteId(exp.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {eduExp.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-800">Pendidikan</h2>
                <Badge variant="info">{eduExp.length}</Badge>
              </div>
              <div className="space-y-3">
                {eduExp.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    exp={exp}
                    onEdit={() => openEdit(exp)}
                    onDelete={() => setDeleteId(exp.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? "Edit Experience" : "Tambah Experience"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tipe <span className="text-red-500">*</span>
            </label>
            <select {...register("type", { required: true })} className="input-field">
              <option value="work">Pekerjaan</option>
              <option value="edu">Pendidikan</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jabatan / Gelar <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { required: "Wajib diisi" })}
                className="input-field"
                placeholder="Senior Engineer"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Perusahaan / Institusi <span className="text-red-500">*</span>
              </label>
              <input
                {...register("organization", { required: "Wajib diisi" })}
                className="input-field"
                placeholder="Google"
              />
              {errors.organization && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.organization.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("start_date", { required: "Wajib diisi" })}
                className="input-field"
              />
              {errors.start_date && (
                <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Selesai
              </label>
              <input
                type="date"
                {...register("end_date")}
                disabled={isCurrent}
                className="input-field disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          {/* Is Current */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              {...register("is_current")}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <label htmlFor="is_current" className="text-sm text-gray-700">
              Masih berlangsung hingga sekarang
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="input-field resize-none"
              placeholder="Deskripsi pekerjaan/pendidikan..."
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Urutan Tampil
            </label>
            <input
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              className="input-field w-24"
              min={1}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? "Menyimpan..." : editItem ? "Simpan" : "Tambahkan"}
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
        title="Hapus Experience"
        message="Apakah kamu yakin ingin menghapus experience ini?"
      />
    </div>
  );
}

function ExperienceCard({
  exp,
  onEdit,
  onDelete,
}: {
  exp: Experience;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-medium text-gray-800 text-sm">{exp.title}</p>
          {exp.is_current && <Badge variant="success">Aktif</Badge>}
          <Badge variant="default">#{exp.display_order}</Badge>
        </div>
        <p className="text-sm text-gray-500">{exp.organization}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDate(exp.start_date)} —{" "}
          {exp.is_current ? "Sekarang" : formatDate(exp.end_date)}
        </p>
        {exp.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exp.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
