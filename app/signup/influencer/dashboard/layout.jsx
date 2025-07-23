// app/signup/influencer/dashboard/layout.jsx
"use client";
import {
  Home,
  Megaphone,
  BadgePercent,
  Youtube,
  Wallet,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen font-[Poppins]">
      {/* Sidebar */}
      <aside
        className="w-[246px] h-[416px] bg-white shadow-md border-r border-gray-200 flex flex-col justify-between"
        style={{ gap: "40px", top: "171px", left: "80px", opacity: 1 }}
      >
        <div>
          <div className="h-16 flex items-center justify-center border-b">
            <img
              src="/freeTym_logo.svg"
              alt="Freetym Logo"
              className="h-10 mb-4"
            />
          </div>
          <nav className="flex flex-col gap-4 mt-6 px-4">
            <SidebarItem icon={<Home size={18} />} label="Home" />
            <SidebarItem icon={<Megaphone size={18} />} label="Campaigns" />
            <SidebarItem icon={<BadgePercent size={18} />} label="Media Kit" />
            <SidebarItem
              icon={<Youtube size={18} />}
              label="Reels Inspiration"
            />
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Money Calculator"
            />
            <SidebarItem icon={<Wallet size={18} />} label="Wallet" />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-[#FFF8F0]">{children}</div>
    </div>
  );
}

function SidebarItem({ icon, label }) {
  return (
    <div
      className="flex items-center gap-3 px-2 py-2 text-sm rounded-md cursor-pointer transition duration-200
        hover:bg-[linear-gradient(96.73deg,#FFE3B3_2.18%,#FFC6A5_98.06%)]"
    >
      {icon}
      {label}
    </div>
  );
}
