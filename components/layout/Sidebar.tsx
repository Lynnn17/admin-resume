"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Briefcase,
  FolderKanban,
  Layers,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/experiences", label: "Experiences", icon: Briefcase },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/skills", label: "Skills", icon: Layers },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Resume CMS</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                size={18}
                className={
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="text-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2024 Resume CMS</p>
      </div>
    </aside>
  );
}
