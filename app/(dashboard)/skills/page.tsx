"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { skillService } from "@/services/skillService";
import {
  SkillCategory,
  SkillItem,
  SkillCategoryPayload,
  SkillItemPayload,
} from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Layers, ChevronDown, ChevronUp } from "lucide-react";

export default function SkillsPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<SkillCategory | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Skill modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<{ item: SkillItem; catId: number } | null>(null);
  const [deleteSkillId, setDeleteSkillId] = useState<number | null>(null);
  const [isDeletingSkill, setIsDeletingSkill] = useState(false);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [activeCatIdForSkill, setActiveCatIdForSkill] = useState<number | null>(null);

  const {
    register: regCat,
    handleSubmit: handleCat,
    reset: resetCat,
    formState: { errors: catErrors },
  } = useForm<SkillCategoryPayload>();

  const {
    register: regSkill,
    handleSubmit: handleSkill,
    reset: resetSkill,
    formState: { errors: skillErrors },
  } = useForm<SkillItemPayload>();

  const fetchData = useCallback(async () => {
    try {
      const res = await skillService.getAll();
      setCategories(res.data ?? []);
      // Auto-expand first category
      if (res.data?.length > 0) {
        setExpandedCats(new Set([res.data[0].id]));
      }
    } catch {
      toast.error("Gagal memuat data skills");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ======== Category Actions ========
  const openCreateCat = () => {
    setEditCat(null);
    resetCat({ name: "", icon_name: "", color_theme: "#6366f1" });
    setIsCatModalOpen(true);
  };

  const openEditCat = (cat: SkillCategory) => {
    setEditCat(cat);
    resetCat({ name: cat.name, icon_name: cat.icon_name, color_theme: cat.color_theme });
    setIsCatModalOpen(true);
  };

  const onSubmitCat = async (data: SkillCategoryPayload) => {
    setIsSavingCat(true);
    try {
      if (editCat) {
        await skillService.updateCategory(editCat.id, data);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await skillService.createCategory(data);
        toast.success("Kategori berhasil ditambahkan");
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan kategori");
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCat = async () => {
    if (!deleteCatId) return;
    setIsDeletingCat(true);
    try {
      await skillService.deleteCategory(deleteCatId);
      toast.success("Kategori berhasil dihapus");
      setDeleteCatId(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus kategori");
    } finally {
      setIsDeletingCat(false);
    }
  };

  // ======== Skill Actions ========
  const openCreateSkill = (catId: number) => {
    setEditSkill(null);
    setActiveCatIdForSkill(catId);
    resetSkill({ category_id: catId, name: "", proficiency: 80 });
    setIsSkillModalOpen(true);
  };

  const openEditSkill = (item: SkillItem, catId: number) => {
    setEditSkill({ item, catId });
    resetSkill({ category_id: catId, name: item.name, proficiency: item.proficiency });
    setIsSkillModalOpen(true);
  };

  const onSubmitSkill = async (data: SkillItemPayload) => {
    setIsSavingSkill(true);
    try {
      if (editSkill) {
        await skillService.updateSkill(editSkill.item.id, data);
        toast.success("Skill berhasil diperbarui");
      } else {
        await skillService.createSkill(data);
        toast.success("Skill berhasil ditambahkan");
      }
      setIsSkillModalOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan skill");
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (!deleteSkillId) return;
    setIsDeletingSkill(true);
    try {
      await skillService.deleteSkill(deleteSkillId);
      toast.success("Skill berhasil dihapus");
      setDeleteSkillId(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus skill");
    } finally {
      setIsDeletingSkill(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Skills"
        subtitle="Kelola kategori dan item keahlian"
        action={
          <button onClick={openCreateCat} className="btn-primary">
            <Plus size={16} />
            Tambah Kategori
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="Belum ada skill"
          description="Mulai dengan menambahkan kategori skill baru"
        />
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const isExpanded = expandedCats.has(cat.id);
            return (
              <div key={cat.id} className="card overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between p-5">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => toggleExpand(cat.id)}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cat.color_theme + "20" }}
                    >
                      <Layers
                        size={18}
                        style={{ color: cat.color_theme || "#6366f1" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{cat.name}</p>
                      <p className="text-xs text-gray-400">
                        {cat.skills?.length ?? 0} skill •{" "}
                        {cat.icon_name && `icon: ${cat.icon_name}`}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400 ml-2" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400 ml-2" />
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 ml-4">
                    <button
                      onClick={() => openCreateSkill(cat.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Tambah skill"
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      onClick={() => openEditCat(cat)}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Skills List */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-4">
                    {!cat.skills || cat.skills.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">
                        Belum ada skill dalam kategori ini.{" "}
                        <button
                          onClick={() => openCreateSkill(cat.id)}
                          className="text-indigo-600 hover:underline"
                        >
                          Tambah sekarang
                        </button>
                      </p>
                    ) : (
                      <div className="space-y-3 pt-4">
                        {cat.skills.map((skill) => (
                          <div key={skill.id} className="group flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {skill.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {skill.proficiency}%
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${skill.proficiency}%`,
                                    backgroundColor: cat.color_theme || "#6366f1",
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditSkill(skill, cat.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteSkillId(skill.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editCat ? "Edit Kategori" : "Tambah Kategori"}
        size="sm"
      >
        <form onSubmit={handleCat(onSubmitCat)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              {...regCat("name", { required: "Wajib diisi" })}
              className="input-field"
              placeholder="Frontend"
            />
            {catErrors.name && (
              <p className="text-xs text-red-500 mt-1">{catErrors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Icon Name
            </label>
            <input
              {...regCat("icon_name")}
              className="input-field"
              placeholder="monitor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Warna Tema
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...regCat("color_theme")}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <input
                {...regCat("color_theme")}
                className="input-field flex-1"
                placeholder="#6366f1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={isSavingCat} className="btn-primary">
              {isSavingCat ? "Menyimpan..." : editCat ? "Simpan" : "Tambahkan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Skill Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title={editSkill ? "Edit Skill" : "Tambah Skill"}
        size="sm"
      >
        <form onSubmit={handleSkill(onSubmitSkill)} className="space-y-4">
          <input type="hidden" {...regSkill("category_id", { valueAsNumber: true })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Skill <span className="text-red-500">*</span>
            </label>
            <input
              {...regSkill("name", { required: "Wajib diisi" })}
              className="input-field"
              placeholder="ReactJS"
            />
            {skillErrors.name && (
              <p className="text-xs text-red-500 mt-1">{skillErrors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proficiency (0 - 100)
            </label>
            <input
              type="number"
              {...regSkill("proficiency", {
                valueAsNumber: true,
                min: { value: 0, message: "Min 0" },
                max: { value: 100, message: "Max 100" },
              })}
              className="input-field"
              min={0}
              max={100}
            />
            {skillErrors.proficiency && (
              <p className="text-xs text-red-500 mt-1">{skillErrors.proficiency.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSkillModalOpen(false)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={isSavingSkill} className="btn-primary">
              {isSavingSkill ? "Menyimpan..." : editSkill ? "Simpan" : "Tambahkan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirm */}
      <ConfirmDialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCat}
        isLoading={isDeletingCat}
        title="Hapus Kategori"
        message="Menghapus kategori akan menghapus semua skill di dalamnya. Lanjutkan?"
      />

      {/* Delete Skill Confirm */}
      <ConfirmDialog
        isOpen={!!deleteSkillId}
        onClose={() => setDeleteSkillId(null)}
        onConfirm={handleDeleteSkill}
        isLoading={isDeletingSkill}
        title="Hapus Skill"
        message="Apakah kamu yakin ingin menghapus skill ini?"
      />
    </div>
  );
}
