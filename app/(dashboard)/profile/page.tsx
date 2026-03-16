"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { profileService } from "@/services/profileService";
import { fileService } from "@/services/fileService";
import { Profile, UpdateProfilePayload } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { User, Save, Upload } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfilePayload>();

  const avatarUrlValue = watch("avatar_url");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileService.getProfile();
        if (res.data) {
          const p = res.data;
          reset({
            name: p.name,
            role: p.role,
            bio: p.bio,
            about_text: p.about_text,
            avatar_url: p.avatar_url,
            is_available: p.is_available,
            email: p.email,
            social_github: p.social_github,
            social_linkedin: p.social_linkedin,
          });
          if (p.avatar_url) {
            setAvatarPreview(fileService.getFileUrl(p.avatar_url));
          }
        }
      } catch {
        toast.error("Gagal memuat data profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const onSubmit = async (data: UpdateProfilePayload) => {
    setIsSaving(true);
    try {
      let finalData = { ...data };

      if (selectedFile) {
        setIsUploading(true);
        try {
          const path = await fileService.upload(selectedFile);
          finalData.avatar_url = path;
          setSelectedFile(null);
        } catch {
          toast.error("Gagal upload foto profil");
          setIsSaving(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      await profileService.updateProfile(finalData);
      toast.success("Profile berhasil diperbarui");
    } catch {
      toast.error("Gagal menyimpan profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Kelola informasi profil personal kamu"
        action={
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50">
            <User size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Data Diri</span>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 mb-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="rounded-full object-cover"
                />
              ) : (
                // <Image
                //   src={avatarPreview}
                //   alt="Avatar"
                //   fill
                //   className="rounded-full object-cover"
                // />
                <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={40} className="text-indigo-400" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <LoadingSpinner size={20} />
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Foto Profil
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Upload size={14} />
                {isUploading ? "Mengupload..." : "Ganti Foto"}
              </span>
            </label>
            <input type="hidden" {...register("avatar_url")} />
            {avatarUrlValue && (
              <p className="text-xs text-gray-400 mt-2 break-all">
                {avatarUrlValue}
              </p>
            )}
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name", { required: "Nama wajib diisi" })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role / Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("role", { required: "Role wajib diisi" })}
                    className="input-field"
                    placeholder="Software Engineer"
                  />
                  {errors.role && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_available"
                    {...register("is_available")}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <label
                    htmlFor="is_available"
                    className="text-sm text-gray-700"
                  >
                    Tersedia untuk pekerjaan baru
                  </label>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Bio & Deskripsi
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bio Singkat
                  </label>
                  <textarea
                    {...register("bio")}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Deskripsi singkat tentang diri kamu..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    About Text (Detail)
                  </label>
                  <textarea
                    {...register("about_text")}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Penjelasan detail tentang kamu..."
                  />
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Social Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    GitHub
                  </label>
                  <input
                    {...register("social_github")}
                    className="input-field"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    LinkedIn
                  </label>
                  <input
                    {...register("social_linkedin")}
                    className="input-field"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
