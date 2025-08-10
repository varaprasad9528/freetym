"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RequestDemoModal from "@/components/RequestDemoModal";
import LoginModal from "@/components/LoginModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [showRequestDemo, setShowRequestDemo] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageOpen && !event.target.closest(".relative")) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageOpen]);

  // put this above the return (inside your component)
  const navLinks = [
    { label: "For Brands", href: "/signup/brand" },
    { label: "For Agencies", href: "/signup/agency" },
    { label: "For Creators", href: "/signup/influencer" },
    { label: "Pricing", href: "/pricing" },
    { label: "In News", href: "/news" },
  ];

  return (
    <header
      className="shadow-[0_4px_12px_rgba(0,0,0,0.25)] sticky top-0 z-50 px-6 py-4"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/freetym.svg"
              alt="Freetym"
              className="h-8 w-auto mr-0.5"
            />
            <img src="/freetym_logo.svg" alt="Freetym" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Navigation (desktop) */}
        <nav className="hidden md:flex items-center space-x-4 ml-12">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-gray-800 px-3 py-1.5 transition-all duration-200 ease-in-out hover:text-blue-600"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Side - Auth & Language */}
        <div className="flex items-center gap-4 ml-10">
          {/* Sign Up & Sign In */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Link href="/signup">
              <button className="text-gray-700 hover:underline transition-colors">
                Sign Up
              </button>
            </Link>
            <span className="text-gray-400">|</span>
            <button
              className="text-gray-700 hover:underline transition-colors"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          </div>

          {/* Request Demo Button */}
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
            onClick={() => setShowRequestDemo(true)}
          >
            Request Demo
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src="/indian-flag.svg"
                  alt="Indian Flag"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">EN</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isLanguageOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isLanguageOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {[{ img: "/indian-flag.svg", label: "EN (IND)" }].map(
                    ({ img, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-5 h-4 rounded overflow-hidden border border-gray-300 flex items-center justify-center">
                          <img
                            src={img}
                            alt={label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {label}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-3 pt-4 text-sm">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="text-gray-700 hover:text-orange-500 transition-colors">
                  Sign Up
                </button>
              </Link>
              <span className="text-gray-400">|</span>
              <button
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => {
                  setShowLogin(true);
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </button>
            </div>
          </nav>
        </div>
      )}

      <RequestDemoModal
        open={showRequestDemo}
        onClose={() => setShowRequestDemo(false)}
      />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}
