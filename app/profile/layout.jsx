"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, KeyRound, Phone, Home, IndianRupee, Bell } from "lucide-react";

const menu = [
  {
    label: "Personal Details",
    icon: <User size={17} />,
    href: "/profile",
  },
  {
    label: "Username",
    icon: <KeyRound size={17} />,
    href: "/profile/username",
  },
  {
    label: "Contact Details",
    icon: <Phone size={17} />,
    href: "/profile/contact-details",
  },
  {
    label: "Address Details",
    icon: <Home size={17} />,
    href: "/profile/address-details",
  },
  {
    label: "Commercials",
    icon: <IndianRupee size={17} />,
    href: "/profile/commercials",
  },
  {
    label: "Subscription",
    icon: <Bell size={17} />,
    href: "/profile/subscription",
  },
];

export default function ProfileLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className="w-[240px] flex flex-col py-6"
        style={{
          borderRight: "2px solid #939393",
          background: "#fff",
        }}
      >
        {/* Logo and title */}
        <div className="px-8 mb-3">
          <img src="/freetym_logo.svg" alt="Freetym" className="h-7 mb-7" />
          <div className="text-lg font-semibold mb-5">Profile</div>
        </div>
        {/* Menu */}
        <nav className="flex flex-col gap-1 px-1">
          {menu.map((item) => (
            <SidebarLink
              key={item.label}
              icon={item.icon}
              label={item.label}
              selected={pathname === item.href}
              href={item.href}
            />
          ))}
        </nav>
      </aside>
      {/* Content */}
      <div className="flex-1 bg-[#FFF8F0]">{children}</div>
    </div>
  );
}

// SidebarLink with gradient highlight
function SidebarLink({ icon, label, selected, href }) {
  return (
    <Link href={href} className="block no-underline w-full">
      <div
        className={`flex items-center px-5 py-2.5 text-sm font-normal rounded-l-full cursor-pointer transition-all mb-1`}
        style={
          selected
            ? {
                background:
                  "linear-gradient(96.73deg, #FFE3B3 2.18%, #FFC6A5 98.06%)",
                color: "#F16623",
                fontWeight: 600,
              }
            : { color: "#191919" }
        }
      >
        <span className="mr-3">{icon}</span>
        {label}
      </div>
    </Link>
  );
}
