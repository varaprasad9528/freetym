import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

function PinterestIcon({ className = "" }) {
  // Simple Pinterest "P" logo as SVG, styled via Tailwind classes
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 4.99 3.657 9.163 8.438 10.094-.12-.861-.23-2.19.05-3.128.25-.857 1.556-5.29 1.556-5.29s-.397-.794-.397-1.968c0-1.843 1.068-3.221 2.4-3.221 1.132 0 1.678.85 1.678 1.87 0 1.139-.724 2.84-1.098 4.423-.312 1.323.662 2.403 1.962 2.403 2.355 0 3.937-3.027 3.937-6.607 0-2.724-1.835-4.765-5.172-4.765-3.775 0-6.135 2.818-6.135 5.968 0 1.085.418 2.251.94 2.884.102.125.118.234.087.36-.095.394-.31 1.252-.352 1.426-.054.224-.176.272-.407.164-1.513-.705-2.46-2.915-2.46-4.693 0-3.819 2.777-7.326 8.01-7.326 4.206 0 7.476 2.996 7.476 6.997 0 4.179-2.635 7.544-6.294 7.544-1.229 0-2.385-.638-2.78-1.387l-.756 2.882c-.273 1.047-1.014 2.357-1.51 3.156C9.28 23.84 10.62 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      className="px-6 py-16 mt-20 font-[Poppins] text-[#111827] text-sm"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center lg:text-left">
        {/* Top Section */}
        <div className="w-full flex flex-col lg:flex-row justify-between gap-16 mb-12">
          <div className="flex flex-col items-center lg:items-start">
            {/* Logo */}
            <img src="/freeTym_logo.svg" alt="Freetym" className="h-14 mb-4" />

            {/* Icons row constrained to logo width */}
            <div className="flex justify-between w-[220px]">
              <a
                href="https://www.instagram.com/freetymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://www.facebook.com/freetymofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/company/freetymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href="https://www.youtube.com/@FreetymOfficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href="https://in.pinterest.com/freetymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <PinterestIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Footer Columns (unchanged) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
            {/* COMPANY */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                COMPANY
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Ranking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Become a Partner
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Customers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Affiliate Program
                  </a>
                </li>
              </ul>
            </div>

            {/* RESOURCES */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                RESOURCES
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Free Tools
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog Sitemap
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Industries
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Sponsoring
                  </a>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                SUPPORT
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Getting Started
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Request Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Pricing Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                LEGAL
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Cookie Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[13px] text-[#4B5563] leading-[20px] max-w-[820px] px-4 mx-auto mb-6 text-left">
          <p>
            <span className="font-semibold">
              Freetym is an independent influencer marketing software platform.
            </span>{" "}
            We are not affiliated with, endorsed by, or officially connected to
            Instagram or YouTube, or any of their parent companies,
            subsidiaries, or affiliates. All trademarks, logos, and brand names
            are the property of their respective owners.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-600 text-center px-4">
          <p className="mb-1">
            Copyright © 2025 Freetym All Rights Reserved | A Product of Wookoo
            Media.
          </p>
          <p>
            Designed and developed by{" "}
            <a href="#" className="text-blue-700 hover:underline">
              NYB Infotech LLP
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
