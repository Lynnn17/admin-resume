"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, Bell } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Berhasil logout");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <p className="text-sm text-gray-500">
          Selamat datang,{" "}
          <span className="font-semibold text-gray-800">{user?.nama ?? "Admin"}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell size={18} />
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-600">
            {user?.nama?.charAt(0).toUpperCase() ?? "A"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
