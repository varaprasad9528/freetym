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

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const isMatch = (base) =>
    pathname === base || pathname.startsWith(base + "/");
  const isHomeActive =
    pathname === "/influencer/dashboard" ||
    pathname === "/influencer/dashboard/report" ||
    pathname.startsWith("/influencer/dashboard/report/");

  const items = [
    {
      label: "Home",
      href: "/influencer/dashboard",
      icon: <Home size={18} />,
      active: isHomeActive,
    },
    {
      label: "Campaigns",
      href: "/influencer/dashboard/campaigns",
      icon: <Megaphone size={18} />,
      active: isMatch("/influencer/dashboard/campaigns"),
    },
    {
      label: "Media Kit",
      href: "/influencer/dashboard/media-kit",
      icon: <BadgePercent size={18} />,
      active: isMatch("/influencer/dashboard/media-kit"),
    },
    {
      label: "Reels Inspiration",
      href: "/influencer/dashboard/reels",
      icon: <Youtube size={18} />,
      active: isMatch("/influencer/dashboard/reels"),
    },
    {
      label: "Money Calculator",
      href: "/influencer/dashboard/calculator",
      icon: <LayoutDashboard size={18} />,
      active: isMatch("/influencer/dashboard/calculator"),
    },
    {
      label: "Wallet",
      href: "/influencer/dashboard/wallet",
      icon: <Wallet size={18} />,
      active: isMatch("/influencer/dashboard/wallet"),
    },
  ];

  return (
    <div className="flex min-h-screen font-[Poppins]">
      <aside
        className="w-[210px] min-h-screen bg-white flex flex-col"
        style={{ borderRight: "2px solid #939393" }}
      >
        <div className="flex-1 flex flex-col">
          <div>
            <div className="h-16 flex items-center justify-center">
              <img
                src="/freeTym_logo.svg"
                alt="Freetym Logo"
                className="h-10 mb-4"
              />
            </div>
            <nav className="flex flex-col gap-4 mt-6">
              {items.map((it) => (
                <SidebarItem key={it.href} {...it} />
              ))}
            </nav>
          </div>

          <div className="flex-1" />

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

function SidebarItem({ icon, label, href, active }) {
  return (
    <Link
      href={href}
      className="no-underline block w-full"
      aria-current={active ? "page" : undefined}
    >
      <div
        className="flex items-center gap-2 py-2 text-sm cursor-pointer transition duration-200 w-full"
        style={
          active
            ? {
                background:
                  "linear-gradient(96.73deg, #FFE3B3 2.18%, #FFC6A5 98.06%)",
              }
            : undefined
        }
      >
        <span
          className="flex items-center"
          style={{ color: active ? "#F16623" : undefined, paddingLeft: "50px" }}
        >
          {icon}
        </span>
        <span style={{ color: "#000", flex: 1 }}>{label}</span>
      </div>
    </Link>
  );
}
