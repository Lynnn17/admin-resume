import {
  LayoutDashboard,
  User,
  Briefcase,
  FolderKanban,
  Layers,
  Users,
} from "lucide-react";
import Link from "next/link";

const cards = [
  {
    title: "Profile",
    description: "Kelola data diri, bio, dan informasi kontak",
    href: "/profile",
    icon: User,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Experiences",
    description: "Kelola riwayat pekerjaan dan pendidikan",
    href: "/experiences",
    icon: Briefcase,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Projects",
    description: "Kelola portfolio dan proyek yang telah dibuat",
    href: "/projects",
    icon: FolderKanban,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Skills",
    description: "Kelola keahlian dan kategori skill",
    href: "/skills",
    icon: Layers,
    color: "bg-orange-50 text-orange-600",
  },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-indigo-100">
            <LayoutDashboard className="text-indigo-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-sm text-gray-500">
          Selamat datang di Resume CMS. Kelola semua konten resume kamu dari
          sini.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ title, description, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group"
          >
            <div
              className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${color}`}
            >
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
