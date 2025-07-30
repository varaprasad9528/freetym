"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Megaphone,
  BadgePercent,
  Youtube,
  Wallet,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen font-[Poppins]">
      {/* Sidebar */}
      <aside
        className="w-[210px] min-h-screen bg-white flex flex-col"
        style={{
          borderRight: "2px solid #939393",
        }}
      >
        <div>
          <div className="h-16 flex items-center justify-center">
            <img
              src="/freeTym_logo.svg"
              alt="Freetym Logo"
              className="h-10 mb-4"
            />
          </div>
          {/* nav has ZERO px, pl, or pr */}
          <nav className="flex flex-col gap-4 mt-6">
            <SidebarItem
              icon={<Home size={18} />}
              label="Home"
              href="/signup/influencer/dashboard"
              active={pathname === "/signup/influencer/dashboard"}
            />
            <SidebarItem
              icon={<Megaphone size={18} />}
              label="Campaigns"
              href="/signup/influencer/dashboard/campaigns"
              active={pathname === "/signup/influencer/dashboard/campaigns"}
            />
            <SidebarItem
              icon={<BadgePercent size={18} />}
              label="Media Kit"
              href="/signup/influencer/dashboard/media-kit"
              active={pathname === "/signup/influencer/dashboard/media-kit"}
            />
            <SidebarItem
              icon={<Youtube size={18} />}
              label="Reels Inspiration"
              href="/signup/influencer/dashboard/reels"
              active={pathname === "/signup/influencer/dashboard/reels"}
            />
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Money Calculator"
              href="/signup/influencer/dashboard/calculator"
              active={pathname === "/signup/influencer/dashboard/calculator"}
            />
            <SidebarItem
              icon={<Wallet size={18} />}
              label="Wallet"
              href="/signup/influencer/dashboard/wallet"
              active={pathname === "/signup/influencer/dashboard/wallet"}
            />
          </nav>
        </div>
      </aside>
      <div className="flex-1 bg-[#FFF8F0]">{children}</div>
    </div>
  );
}

// THE SIDEBAR ITEM:
function SidebarItem({ icon, label, href, active }) {
  return (
    <Link href={href} className="no-underline block w-full">
      <div
        className={`flex items-center gap-2 py-2 text-sm cursor-pointer transition duration-200 w-full`}
        style={
          active
            ? {
                background:
                  "linear-gradient(96.73deg, #FFE3B3 2.18%, #FFC6A5 98.06%)",
              }
            : {}
        }
      >
        <span
          className="flex items-center"
          style={{
            color: active ? "#F16623" : undefined,
            paddingLeft: "50px",
          }}
        >
          {icon}
        </span>
        <span style={{ color: "#000", flex: 1 }}>{label}</span>
      </div>
    </Link>
  );
}
