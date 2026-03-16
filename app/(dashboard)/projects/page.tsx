"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { projectService } from "@/services/projectService";
import { fileService } from "@/services/fileService";
import { Project, ProjectPayload } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [toolInput, setToolInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tools, setTools] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectPayload>();

  const fetchData = useCallback(async () => {
    try {
      const res = await projectService.getAll();
      setProjects(res.data ?? []);
    } catch {
      toast.error("Gagal memuat data project");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setTools([]);
    setImagePreview("");
    setSelectedFile(null);
    reset({
      title: "",
      slug: "",
      description: "",
      category: "",
      image_url: "",
      tools: [],
      demo_url: "",
      repo_url: "",
      color_theme: "#6366f1",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: Project) => {
    setEditItem(item);
    setTools(item.tools ?? []);
    setSelectedFile(null);
    setImagePreview(
      item.image_url ? fileService.getFileUrl(item.image_url) : "",
    );
    reset({
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      image_url: item.image_url,
      tools: item.tools,
      demo_url: item.demo_url,
      repo_url: item.repo_url,
      color_theme: item.color_theme,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const addTool = () => {
    const t = toolInput.trim();
    if (t && !tools.includes(t)) {
      const newTools = [...tools, t];
      setTools(newTools);
      setValue("tools", newTools);
      setToolInput("");
    }
  };

  const removeTool = (t: string) => {
    const newTools = tools.filter((x) => x !== t);
    setTools(newTools);
    setValue("tools", newTools);
  };

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const onSubmit = async (data: ProjectPayload) => {
    setIsSaving(true);
    let currentImageUrl = data.image_url;

    try {
      if (selectedFile) {
        setIsUploading(true);
        try {
          const path = await fileService.upload(selectedFile);
          currentImageUrl = path;
          setSelectedFile(null);
        } catch {
          toast.error("Gagal upload gambar project");
          setIsSaving(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const payload = { ...data, tools, image_url: currentImageUrl };
      if (editItem) {
        await projectService.update(editItem.id, payload);
        toast.success("Project berhasil diperbarui");
      } else {
        await projectService.create(payload);
        toast.success("Project berhasil ditambahkan");
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await projectService.delete(deleteId);
      toast.success("Project berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Kelola portfolio dan proyek yang telah kamu buat"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            Tambah Project
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="Belum ada project"
          description="Tambahkan portfolio project kamu"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => openEdit(project)}
              onDelete={() => setDeleteId(project.id)}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? "Edit Project" : "Tambah Project"}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gambar Project
            </label>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Upload size={20} />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <LoadingSpinner size={16} />
                  </div>
                )}
              </div>
              <label className="cursor-pointer btn-secondary">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload size={14} />
                {isUploading ? "Mengupload..." : "Upload Gambar"}
              </label>
            </div>
            <input type="hidden" {...register("image_url")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { required: "Wajib diisi" })}
                className="input-field"
                placeholder="Project Alpha"
                onChange={(e) => {
                  register("title").onChange(e);
                  if (!editItem) setValue("slug", generateSlug(e.target.value));
                }}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                {...register("slug", { required: "Wajib diisi" })}
                className="input-field"
                placeholder="project-alpha"
              />
              {errors.slug && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kategori
              </label>
              <input
                {...register("category")}
                className="input-field"
                placeholder="Web App, Mobile, etc"
              />
            </div>

            {/* Color Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Warna Tema
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("color_theme")}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  {...register("color_theme")}
                  className="input-field flex-1"
                  placeholder="#6366f1"
                />
              </div>
            </div>
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
              placeholder="Deskripsi project..."
            />
          </div>

          {/* Tools */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tech Stack / Tools
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTool();
                  }
                }}
                className="input-field flex-1"
                placeholder="Tambah tool, tekan Enter"
              />
              <button
                type="button"
                onClick={addTool}
                className="btn-secondary px-3"
              >
                <Plus size={16} />
              </button>
            </div>
            {tools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tools.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
                  >
                    {t}
                    <button type="button" onClick={() => removeTool(t)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Demo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Demo URL
              </label>
              <input
                {...register("demo_url")}
                className="input-field"
                placeholder="https://demo.com"
              />
            </div>

            {/* Repo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Repository URL
              </label>
              <input
                {...register("repo_url")}
                className="input-field"
                placeholder="https://github.com/..."
              />
            </div>
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
        title="Hapus Project"
        message="Apakah kamu yakin ingin menghapus project ini?"
      />
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const imageUrl = project.image_url
    ? `/api/files?path=/files/${encodeURIComponent(project.image_url)}`
    : null;

  return (
    <div className="card overflow-hidden group hover:shadow-md transition-all">
      {/* Image */}
      <div
        className="h-40 relative"
        style={{ backgroundColor: project.color_theme + "20" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: project.color_theme + "30" }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: project.color_theme }}
            >
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Actions Overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-white shadow text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-white shadow text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 text-sm">
            {project.title}
          </h3>
          {project.category && (
            <Badge variant="default">{project.category}</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {project.description}
        </p>

        {/* Tools */}
        {project.tools?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tools.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {t}
              </span>
            ))}
            {project.tools.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                +{project.tools.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              <ExternalLink size={12} />
              Demo
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline"
            >
              <Github size={12} />
              Repo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
