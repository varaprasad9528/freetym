"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  KeyRound,
  Phone,
  Home,
  IndianRupee,
  Bell,
  LogOut,
} from "lucide-react";

/* ---------- role → dashboard path ---------- */
function pathForRole(role) {
  const r = String(role || "")
    .toLowerCase()
    .trim();
  if (r === "influencer") return "/signup/influencer/dashboard";
  if (r === "agent") return "/signup/agent/dashboard";
  if (r === "brand") return "/signup/brand/dashboard";
  return "/dashboard"; // fallback
}

/* Try to read role from localStorage or from a JWT (token/authToken) */
function getUserRole() {
  if (typeof window === "undefined") return null;

  // common keys you might be using elsewhere
  const direct =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("user_type") ||
    localStorage.getItem("type") ||
    localStorage.getItem("accountType");

  if (direct) return direct;

  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  if (!token || token.split(".").length < 2) return null;

  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    return (
      json?.role ||
      json?.userRole ||
      json?.user_type ||
      json?.type ||
      json?.accountType ||
      null
    );
  } catch {
    return null;
  }
}

const menu = [
  { label: "Personal Details", icon: <User size={18} />, href: "/profile" },
  {
    label: "Username",
    icon: <KeyRound size={18} />,
    href: "/profile/username",
  },
  {
    label: "Contact Details",
    icon: <Phone size={18} />,
    href: "/profile/contact-details",
  },
  {
    label: "Address Details",
    icon: <Home size={18} />,
    href: "/profile/address-details",
  },
  {
    label: "Commercials",
    icon: <IndianRupee size={18} />,
    href: "/profile/commercials",
  },
  {
    label: "Subscription",
    icon: <Bell size={18} />,
    href: "/profile/subscription",
  },
];

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Compute the logo destination on the client after we can read localStorage
  const [logoHref, setLogoHref] = useState("/dashboard");
  useEffect(() => {
    const role = getUserRole();
    setLogoHref(pathForRole(role));
  }, []);

  const isActive = (href) => {
    const clean = (p) => (p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p);
    const cur = clean(pathname);
    const base = clean(href);
    if (base === "/profile") return cur === "/profile";
    return cur === base || cur.startsWith(base + "/");
  };

  const handleLogout = () => {
    // clear both, since different pages used different keys earlier
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    sessionStorage.clear();
    document.cookie = "auth=; path=/; max-age=0; samesite=lax";
    router.push("/");
  };

  return (
    <div className="flex min-h-screen font-[Poppins]">
      {/* Sidebar */}
      <aside
        className="w-[210px] min-h-screen bg-white flex flex-col"
        style={{ borderRight: "2px solid #939393" }}
      >
        <div className="flex-1 flex flex-col">
          {/* Logo + Profile title */}
          <div>
            <div className="h-16 flex items-center justify-center">
              {/* Dynamic logo link based on role */}
              <Link
                href={logoHref}
                aria-label="Go to Dashboard"
                className="inline-flex"
              >
                <img
                  src="/freetym_logo.svg"
                  alt="Freetym Logo"
                  className="h-10 mb-4"
                />
              </Link>
            </div>

            <div
              className="font-semibold mt-0"
              style={{ paddingLeft: "60px", fontSize: "1.4rem", color: "#000" }}
            >
              Profile
            </div>

            {/* Menu */}
            <nav className="flex flex-col gap-4 mt-6">
              {menu.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={isActive(item.href)}
                />
              ))}
            </nav>

            {/* Logout button below menu */}
            <div className="mt-16">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-sm cursor-pointer transition duration-200 w-full border-t border-[#E0E0E0]"
                style={{ paddingLeft: "50px", color: "#000" }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 bg-[#FFF8F0]">{children}</div>
    </div>
  );
}

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
          style={{ color: active ? "#F16623" : undefined, paddingLeft: "50px" }}
        >
          {icon}
        </span>
        <span style={{ color: "#000", flex: 1 }}>{label}</span>
      </div>
    </Link>
  );
}
