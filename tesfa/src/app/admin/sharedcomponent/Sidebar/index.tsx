"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Users, Bot, User } from "lucide-react";
const menuItems = [
  { id: 1, href: "/dashboard", icon: LayoutDashboard, name: "Dashboard" },
  { id: 2, href: "/admin/task-tracking", icon: ClipboardList, name: "Tasks" },
  { id: 3, href: "/admin/organizations", icon: Users, name: "Organizations" },
  { id: 4, href: "/performance", icon: Bot, name: "Performance" },
];
export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="w-64 h-screen bg-teal-900 flex flex-col justify-between text-white">
      <div className="px-1 bg-teal-900 flex flex-col justify-between text-white">
        <div className="flex items-center px-3 py-6 mb-10">
          <Image
            src="/Images/adminLogo.png"
            alt="Tesfa Logo"
            className="h-12 w-15"
            width={60} 
            height={48}
          />
        </div>
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            const label = item.name;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`cursor-pointer px-6 py-3 mt-4 rounded-l-4xl gap-8 transition-colors flex items-center ${
                  isActive ? "bg-yellow-500 text-black w-63" : "hover:bg-teal-700 w-63"
                }`}
              >
                <Icon size={28} />
                <label className="text-md cursor-pointer">{label}</label>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-5 px-6 py-4 bg-teal-800">
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">
          <User size={20} />
        </div>
        <p className="items-center font-medium">Tesfa admin</p>
      </div>
    </div>
  );
}
