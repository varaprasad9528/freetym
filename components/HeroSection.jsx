"use client";

import { useState, useEffect, useRef } from "react";

export default function HeroSection() {
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const platformButtonRef = useRef(null);
  const platformDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categoryList = [
    "Art & Design",
    "Beauty & Fashion",
    "Comedy",
    "DIY & How-To",
    "Fitness & Wellness",
    "Lifestyle & Vlogs",
    "Motivation",
    "Travel & Nature",
    "Business",
  ];

  const [selectedCategories, setSelectedCategories] = useState([]);

  // --- NEW: API base from env (fallback to relative path) ---
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  const PUBLIC_BASE = API_BASE ? `${API_BASE}/api/public` : "/api/public";

  // --- NEW: search state ---
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAll = () => setSelectedCategories(categoryList);
  const handleClear = () => setSelectedCategories([]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showPlatformDropdown &&
        platformButtonRef.current &&
        !platformButtonRef.current.contains(event.target) &&
        platformDropdownRef.current &&
        !platformDropdownRef.current.contains(event.target)
      ) {
        setShowPlatformDropdown(false);
      }
      if (
        showCategoryDropdown &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlatformDropdown, showCategoryDropdown]);

  const platformIcons = {
    Instagram:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    YouTube:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_(2017).svg",
  };

  // 🔑 cross-page focus
  useEffect(() => {
    const hero = document.getElementById("hero-section");
    const input = document.getElementById("influencer-search-input");

    const arrivedWithIntent =
      sessionStorage.getItem("focusInfluencerSearch") === "1";
    const urlHasHash =
      typeof window !== "undefined" && window.location.hash === "#hero-section";

    if (arrivedWithIntent || urlHasHash) {
      sessionStorage.removeItem("focusInfluencerSearch");
      if (hero) hero.scrollIntoView({ behavior: "smooth" });

      const tryFocus = () => {
        const el = document.getElementById("influencer-search-input");
        if (el && typeof el.focus === "function") el.focus();
        else requestAnimationFrame(tryFocus);
      };
      tryFocus();
    }
  }, []);

  // --- NEW: search handler using env-based URL ---
  const handleSearch = async () => {
    setErr("");
    setResults([]);
    const q = searchQuery.trim();
    const platform = selectedPlatform.toLowerCase(); // instagram | youtube

    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (platform) params.set("platform", platform);
    if (selectedCategories.length)
      params.set("categories", selectedCategories.join(","));

    const url = `${PUBLIC_BASE}/search?${params.toString()}`;

    try {
      setLoading(true);
      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || "Search failed");
        return;
      }
      // accept either array or {results:[...]}
      const items = Array.isArray(data) ? data : data.results || [];
      setResults(items);
    } catch (e) {
      setErr("Network error while searching");
    } finally {
      setLoading(false);
    }
  };

  // --- Enter key triggers search ---
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    // ✅ Add the hero id here
    <section
      id="hero-section"
      className="px-6 py-16"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <h1
          className="font-bold text-black mb-2"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: "100%",
          }}
        >
          All-In-One Influencer Marketing <br />
          Platform Trusted by Brands & Agencies
        </h1>
        <p
          className="text-gray-600 mb-12"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "36px",
            fontWeight: 500,
            lineHeight: "100%",
          }}
        >
          Empowering Influencers & Elevating Brands
        </p>
      </div>

      {/* Orange Box */}
      <div
        className="relative mx-auto p-10 flex flex-col items-center justify-start"
        style={{
          backgroundColor: "#F79966",
          borderRadius: "16px",
          boxShadow: "8px 8px 9.2px rgba(0,0,0,0.15)",
          maxWidth: "1100px",
          height: "620px",
          overflow: "hidden",
        }}
      >
        {/* India Map */}
        <img
          src="/india-map.png"
          alt="India Map"
          className="absolute z-0 opacity-60"
          style={{
            top: "130px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            height: "auto",
          }}
        />

        {/* Find Authentic Influencers Text */}
        <div
          className="relative z-10 text-black mb-8 text-center"
          style={{ marginTop: "-22px" }}
        >
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "40px",
              fontWeight: 600,
              lineHeight: "160%",
            }}
          >
            Find Authentic Influencers.
          </h2>
          <p className="text-lg opacity-90">Any industry, Any size!</p>
        </div>

        {/* Search Box */}
        <div className="relative z-10 w-full max-w-2xl my-auto">
          <div className="bg-white rounded-full p-2 flex items-center shadow-lg">
            {/* Platform Selector */}
            <div className="relative">
              <button
                ref={platformButtonRef}
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border-r border-gray-200 rounded-l-full hover:bg-gray-50"
                type="button"
              >
                <img
                  src={platformIcons[selectedPlatform]}
                  alt={`${selectedPlatform} icon`}
                  className="w-5 h-5 object-contain"
                />
                <span className="text-gray-700 font-medium">
                  {selectedPlatform}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
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

              {showPlatformDropdown && (
                <div
                  ref={platformDropdownRef}
                  className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  {Object.entries(platformIcons).map(([platform, icon]) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setShowPlatformDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                      type="button"
                    >
                      <img
                        src={icon}
                        alt={platform}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-sm text-gray-700">{platform}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <input
              id="influencer-search-input"
              type="text"
              placeholder="Search influencers..."
              className="flex-1 px-4 py-2 text-gray-700 bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />

            {/* Search Icon */}
            <button
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
              type="button"
              onClick={handleSearch}
              aria-label="Search"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Filter Icon */}
            <div className="relative">
              <button
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full ml-2"
                type="button"
                onClick={() => setShowCategoryDropdown((v) => !v)}
                aria-label="Filters"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 0 1 9 21v-7.586L3.293 6.707A1 1 0 0 1 3 6V4z"
                  />
                </svg>
              </button>

              {/* Category Dropdown */}
              {showCategoryDropdown && (
                <div
                  ref={categoryDropdownRef}
                  className="absolute right-18 bottom-[52px] w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  style={{
                    fontSize: "13px",
                    minWidth: 150,
                    boxShadow: "0px 2px 8px 0px #00000018",
                    padding: "2px 0",
                  }}
                >
                  <div>
                    {categoryList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`w-full text-left px-3 py-1 rounded ${
                          selectedCategories.includes(cat)
                            ? "bg-gray-100 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                        style={{ fontSize: "13px", padding: "6px 8px" }}
                        type="button"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-2 py-1 border-t border-gray-200 text-xs">
                    <button
                      className="text-blue-600 font-medium hover:underline"
                      style={{ fontSize: "12px" }}
                      onClick={handleSelectAll}
                      type="button"
                    >
                      Select All
                    </button>
                    <button
                      className="text-gray-500 hover:underline"
                      style={{ fontSize: "12px" }}
                      onClick={handleClear}
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- NEW: Results/Status --- */}
          <div className="mt-4">
            {loading && <div className="text-sm text-white/90">Searching…</div>}
            {err && (
              <div className="text-sm text-red-800 bg-white/80 rounded px-3 py-2 inline-block">
                {err}
              </div>
            )}
            {!loading && !err && results?.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {results.map((it, idx) => {
                    // defensive normalization
                    const name =
                      it.name || it.fullName || it.title || "Unknown";
                    const username = it.username || it.handle || it.slug || "";
                    const followers =
                      it.followers ??
                      it.followerCount ??
                      it.subscribers ??
                      it.metrics?.followers ??
                      null;
                    const plat = it.platform || selectedPlatform.toLowerCase();

                    return (
                      <li
                        key={it.id || it._id || idx}
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {name}{" "}
                            {username ? (
                              <span className="text-gray-500">@{username}</span>
                            ) : null}
                          </div>
                          <div className="text-xs text-gray-600">
                            Platform: {plat}
                            {followers != null
                              ? ` • Followers: ${followers}`
                              : ""}
                          </div>
                        </div>
                        {/* placeholder CTA; hook to profile page if you have one */}
                        <button
                          type="button"
                          className="text-xs px-3 py-1 rounded-md bg-[#F16623] text-white font-semibold"
                        >
                          View
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {!loading && !err && results?.length === 0 && searchQuery && (
              <div className="text-sm text-white/90">No results found.</div>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="absolute bottom-6 right-6 z-20 flex space-x-4">
          {/* Trustpilot */}
          <a
            href="#"
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-1 text-white text-sm font-medium flex items-center space-x-1 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Rated 4.5</span>
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>Trustpilot</span>
            <svg
              className="w-4 h-4 text-white opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m7-3h-3a2 2 0 0 0-2 2v3m5-5L10 14"
              />
            </svg>
          </a>

          {/* Google */}
          <a
            href="#"
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-1 text-white text-sm font-medium flex items-center space-x-1 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Rated 4.5</span>
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>Google</span>
            <svg
              className="w-4 h-4 text-white opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m7-3h-3a2 2 0 0 0-2 2v3m5-5L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Brand Logos Full Width */}
      <div className="w-full mt-16 overflow-hidden px-0">
        <div className="relative flex whitespace-nowrap">
          <div className="flex animate-marquee space-x-16 items-center opacity-80 grayscale hover:grayscale-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <img
                key={`logo1-${i}`}
                src="/brand-logos.png"
                alt="Trusted by leading brands"
                className="h-20 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
