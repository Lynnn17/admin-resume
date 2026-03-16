"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { LoginPayload } from "@/types";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  const onSubmit = async (data: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.data) {
        const { token, user } = response.data;
        login(token.AccessToken, {
          id: user.id,
          nama: user.nama,
          email: user.email,
        });
        toast.success("Login berhasil!");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Username atau password salah";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Resume CMS</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk untuk mengelola konten resume kamu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              placeholder="Masukkan username"
              {...register("username", { required: "Username wajib diisi" })}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                errors.username
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                {...register("password", { required: "Password wajib diisi" })}
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Masuk...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Masuk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
