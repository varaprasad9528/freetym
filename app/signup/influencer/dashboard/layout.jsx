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
  User,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Helper: active if exact path or any child route
  const isMatch = (base) =>
    pathname === base || pathname.startsWith(base + "/");

  // Home should be active on dashboard root and the report page (and their subroutes)
  // Replace with:
  const isHomeActive =
    pathname === "/signup/influencer/dashboard" || // only exact root
    pathname === "/signup/influencer/dashboard/report" || // report page
    pathname.startsWith("/signup/influencer/dashboard/report/"); // report subroutes only

  return (
    <div className="flex min-h-screen font-[Poppins]">
      {/* Sidebar */}
      <aside
        className="w-[210px] min-h-screen bg-white flex flex-col"
        style={{ borderRight: "2px solid #939393" }}
      >
        <div className="flex-1 flex flex-col">
          <div>
            <div className="h-16 flex items-center justify-center">
              <img
                src="/freetym_logo.svg"
                alt="Freetym Logo"
                className="h-10 mb-4"
              />
            </div>

            <nav className="flex flex-col gap-4 mt-6">
              <SidebarItem
                icon={<Home size={18} />}
                label="Home"
                href="/signup/influencer/dashboard"
                active={isHomeActive}
              />
              <SidebarItem
                icon={<Megaphone size={18} />}
                label="Campaigns"
                href="/signup/influencer/dashboard/campaigns"
                active={isMatch("/signup/influencer/dashboard/campaigns")}
              />
              <SidebarItem
                icon={<BadgePercent size={18} />}
                label="Media Kit"
                href="/signup/influencer/dashboard/media-kit"
                active={isMatch("/signup/influencer/dashboard/media-kit")}
              />
              <SidebarItem
                icon={<Youtube size={18} />}
                label="Reels Inspiration"
                href="/signup/influencer/dashboard/reels"
                active={isMatch("/signup/influencer/dashboard/reels")}
              />
              <SidebarItem
                icon={<LayoutDashboard size={18} />}
                label="Money Calculator"
                href="/signup/influencer/dashboard/calculator"
                active={isMatch("/signup/influencer/dashboard/calculator")}
              />
              <SidebarItem
                icon={<Wallet size={18} />}
                label="Wallet"
                href="/signup/influencer/dashboard/wallet"
                active={isMatch("/signup/influencer/dashboard/wallet")}
              />
            </nav>
          </div>

          <div className="flex-1" />

          {/* Profile at bottom */}
          <div className="border-t border-gray-300 mt-4">
            <Link href="/profile" className="no-underline block w-full">
              <div
                className="flex items-center gap-2 py-3 text-sm cursor-pointer transition duration-200 w-full"
                style={{ paddingLeft: "36px" }}
              >
                <User size={18} className="mr-2" />
                <span style={{ color: "#000", flex: 1 }}>My Profile</span>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 bg-[#FFF8F0]">{children}</div>
    </div>
  );
}

// Sidebar item
function SidebarItem({ icon, label, href, active }) {
  return (
    <Link href={href} className="no-underline block w-full">
      <div
        className="flex items-center gap-2 py-2 text-sm cursor-pointer transition duration-200 w-full"
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
