import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="px-6 py-16 mt-20 font-[Poppins] text-[#111827] text-sm"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center lg:text-left">
        {/* Top Section */}
        <div className="w-full flex flex-col lg:flex-row justify-between gap-16 mb-12">
          {/* Logo & Socials */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-1/4">
            <img src="/freeTym_logo.svg" alt="Freetym" className="h-10 mb-4" />
            <div className="flex gap-4 justify-center lg:justify-start">
              <a href="#" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-[#111827] hover:text-gray-900" />
              </a>
              <a href="#" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-[#111827] hover:text-gray-900" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 text-[#111827] hover:text-gray-900" />
              </a>
              <a href="#" aria-label="YouTube">
                <Youtube className="w-5 h-5 text-[#111827] hover:text-gray-900" />
              </a>
            </div>
          </div>

          {/* Footer Columns */}
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
