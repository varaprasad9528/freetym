"use client";
import { useEffect, useMemo, useState } from "react";

/* =========================
   Reusable MultiSelectDropdown
   - footer has only Select All / Clear
   - shows "<n> selected" in the trigger (no chips)
========================= */
function MultiSelectDropdown({
  label,
  options = [], // [{ value, label, icon? }]
  value = [], // array of selected values
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const selected = value;

  const toggle = (val) => {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    onChange?.(next);
  };
  const selectAll = () => onChange?.(options.map((o) => o.value));
  const clearAll = () => onChange?.([]);

  // Always show "N selected" when any are chosen
  const labelText =
    selected.length === 0 ? label : `${selected.length} selected`;

  const onBlurWrap = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className={`relative ${className}`} tabIndex={-1} onBlur={onBlurWrap}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full px-4 py-1.5 text-sm bg-white border border-[#E5E5E5] flex items-center gap-2"
      >
        <span>{labelText}</span>
        <span className="text-gray-500">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute mt-2 w-[260px] bg-white rounded-xl shadow-xl z-20 overflow-hidden"
          style={{ border: "1px solid #E5E5E5" }}
        >
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="flex-1">{opt.label}</span>
                <input
                  type="checkbox"
                  readOnly
                  checked={selected.includes(opt.value)}
                />
              </button>
            ))}
          </div>

          {/* Footer: Select All / Clear */}
          <div
            className="flex items-center justify-between px-4 py-2 text-sm bg-white"
            style={{ borderTop: "1px solid #E5E5E5" }}
          >
            <button
              onClick={selectAll}
              className="hover:underline text-gray-700"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="hover:underline text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"
).replace(/\/+$/, "");

export default function CampaignsPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState("my"); // 'my' | 'explore' | 'applied'

  // Paging
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);

  // Data
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);

  // Search (top-right)
  const [search, setSearch] = useState("");

  // Explore multi-select states
  const [popularSel, setPopularSel] = useState([]); // ["popular"] or ["date"]
  const [regionSel, setRegionSel] = useState([]); // ["mumbai","delhi",...]
  const [industrySel, setIndustrySel] = useState([]); // ...
  const [socialSel, setSocialSel] = useState([]); // ["instagram","youtube"]

  // Modal state (Explore card details)
  const [showModal, setShowModal] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState(null);

  function openModal(campaign) {
    setActiveCampaign(campaign);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setActiveCampaign(null);
  }

  // Options for Explore filters
  const popularOptions = [
    { value: "popular", label: "Most popular" },
    { value: "date", label: "Publication date" },
  ];
  const regionOptions = [
    "Hyderabad",
    "Bengaluru",
    "Chennai",
    "Mumbai",
    "Delhi",
    "Kochi",
    "Madurai",
    "Ooty",
    "Mangalore",
  ].map((x) => ({ value: x.toLowerCase(), label: x }));
  const industryOptions = [
    "Business & Startups",
    "Careers & Office",
    "Marketing & Sales",
    "IT & Technology",
    "Arts & Culture",
    "Food & Nutrition",
    "Travel",
    "Fitness",
    "Education",
    "Sports",
    "Gaming & Streaming",
    "Fashion & Beauty",
  ].map((x) => ({ value: x.toLowerCase(), label: x }));
  const socialOptions = [
    { value: "instagram", label: "Instagram", icon: <span>📸</span> },
    { value: "youtube", label: "Youtube", icon: <span>▶️</span> },
  ];

  // Token
  const rawToken =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const authValue = rawToken?.startsWith("Bearer ")
    ? rawToken
    : rawToken
    ? `Bearer ${rawToken}`
    : "";

  const endpointForTab = (tab) => {
    if (tab === "explore")
      return `/api/influencer/campaigns/explore?page=${page}&limit=${limit}`;
    if (tab === "applied")
      return `/api/influencer/campaigns/applied?page=${page}&limit=${limit}`;
    return `/api/influencer/campaigns/my?page=${page}&limit=${limit}`;
  };

  // Fetch data
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}${endpointForTab(activeTab)}`;
        const headers = authValue ? { Authorization: authValue } : {}; // always send if present
        const res = await fetch(url, { headers });

        if (res.status === 401) {
          console.warn("Unauthorized: bad/missing token");
          setRows([]);
          setTotal(0);
          return;
        }

        const json = await res.json();
        if (ignore) return;
        setTotal(json?.total ?? 0);
        setRows(Array.isArray(json?.campaigns) ? json.campaigns : []);
      } catch (e) {
        if (!ignore) {
          console.error(e);
          setTotal(0);
          setRows([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [activeTab, page, limit, authValue]);

  // Helpers
  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const timeAgo = (iso) => {
    if (!iso) return "-";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (Number.isNaN(days)) return "-";
    return days <= 0 ? "today" : `${days}d ago`;
  };

  // Text search predicate
  const textMatches = (c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.brandName || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  };

  // MY/APPLIED (reuse rows; you can split if your APIs differ)
  const filteredMy = useMemo(() => rows.filter(textMatches), [rows, search]);

  // EXPLORE – apply multiselect filters
  const filteredExplore = useMemo(() => {
    let arr = rows.filter(textMatches);

    // Regions
    if (regionSel.length) {
      arr = arr.filter((c) => {
        const region = c.requirements?.socialMedia?.region || c.region || "";
        const val = String(region).toLowerCase();
        return regionSel.some((r) => val.includes(r));
      });
    }
    // Industries
    if (industrySel.length) {
      arr = arr.filter((c) => {
        const industries = Array.isArray(c.requirements?.industries)
          ? c.requirements.industries
          : [];
        const allIndustries = [...industries, c.industry, c.category]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase());
        return industrySel.some((i) =>
          allIndustries.some((ind) => ind.includes(i))
        );
      });
    }
    // Socials (support array or single field)
    if (socialSel.length) {
      arr = arr.filter((c) => {
        // Check requirements.socialMedia.platforms, socials, social, platform
        const platforms = Array.isArray(c.requirements?.socialMedia?.platforms)
          ? c.requirements.socialMedia.platforms
          : [];
        const socials = Array.isArray(c.socials) ? c.socials : [];
        const allPlatforms = [...platforms, ...socials, c.social, c.platform]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase());
        return socialSel.some((s) => allPlatforms.some((p) => p.includes(s)));
      });
    }
    // Popular / Date sort
    if (popularSel.includes("popular")) {
      arr = [...arr].sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (popularSel.includes("date")) {
      arr = [...arr].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }
    return arr;
  }, [rows, search, regionSel, industrySel, socialSel, popularSel]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showRows = activeTab === "explore" ? filteredExplore : filteredMy;

  // Actions
  const viewDetails = (c) => openModal(c);
  const applyToCampaign = async (id) => {
    try {
      const url = `${API_BASE}/api/influencer/campaigns/apply/${id}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: authValue },
      });
      const json = await res.json();
      alert(json?.message || "Applied.");
    } catch {
      alert("Failed to apply.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Main Header with search */}
      <div
        className="flex items-center h-[50px] bg-white px-6"
        style={{
          boxShadow: "0px 4px 4px 0px #00000040",
          borderBottom: "1px solid #939393",
          zIndex: 10,
          position: "relative",
        }}
      >
        <h1
          className="flex-1"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "100%",
            margin: 0,
            paddingLeft: "40px",
          }}
        >
          Campaigns
        </h1>

        <div className="relative w-[250px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
          <input
            type="text"
            placeholder="Search Brands"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      {/* Sub Header Tabs */}
      <div
        className="bg-white px-6"
        style={{
          boxShadow: "0px 4px 4px 0px #00000040",
          borderBottom: "1px solid #939393",
        }}
      >
        <div className="flex gap-6">
          {["my", "explore", "applied"].map((tab) => (
            <button
              key={tab}
              className={`relative py-4 px-1 text-black bg-white ${
                activeTab === tab ? "font-semibold" : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
            >
              {tab === "my"
                ? "My campaigns"
                : tab === "explore"
                ? "Explore campaigns"
                : "Applied campaigns"}
              {activeTab === tab && (
                <span
                  className="absolute left-0 right-0 bottom-0 block h-[3px]"
                  style={{ background: "#F16623" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* -------- MY CAMPAIGNS (table) -------- */}
        {activeTab === "my" && (
          <>
            {/* small status chips row */}
            <div className="flex gap-2 mb-4 mt-4">
              <button
                className="text-white font-semibold py-1 px-4 rounded-full"
                style={{ background: "#F16623" }}
              >
                Planning
              </button>
              <button className="bg-gray-100 text-gray-700 py-1 px-4 rounded-full">
                Ongoing
              </button>
              <button className="bg-gray-100 text-gray-700 py-1 px-4 rounded-full">
                Completed
              </button>
            </div>

            {/* Info cards */}
            <div className="flex gap-4 mb-4">
              <div
                className="bg-white rounded-md p-4 flex-1 text-center"
                style={{ border: "1px solid #CECECE" }}
              >
                <div className="text-xs text-gray-500 mb-1">
                  Active Campaigns
                </div>
                <div className="text-2xl font-bold">0/0</div>
              </div>
              <div
                className="bg-white rounded-md p-4 flex-1 text-center"
                style={{ border: "1px solid #CECECE" }}
              >
                <div className="text-xs text-gray-500 mb-1">
                  Unread Conversations
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div
                className="bg-white rounded-md p-4 flex-[2] text-center"
                style={{ border: "1px solid #CECECE" }}
              >
                <div className="text-xs text-gray-500 mb-1">
                  New Invitations
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>

            {/* Table */}
            <div
              className="bg-white rounded-md p-2 overflow-x-auto"
              style={{ border: "1px solid #CECECE" }}
            >
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#CECECE]">
                    <th className="text-left py-2 px-3 font-semibold">
                      Brands
                    </th>
                    <th className="text-left py-2 px-3 font-semibold">
                      Title of the Campaign
                    </th>
                    <th className="text-left py-2 px-3 font-semibold">
                      Collaboration Status
                    </th>
                    <th className="text-left py-2 px-3 font-semibold">
                      Application Date
                    </th>
                    <th className="text-left py-2 px-3 font-semibold">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center">
                        Loading…
                      </td>
                    </tr>
                  ) : filteredMy.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500"
                      >
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    filteredMy.map((c) => (
                      <tr key={c._id} className="border-b border-[#EFEFEF]">
                        <td className="py-2 px-3">{c.brandName || "-"}</td>
                        <td className="py-2 px-3">{c.title || "-"}</td>
                        <td className="py-2 px-3 capitalize">
                          {c.collaborationStatus || "-"}
                        </td>
                        <td className="py-2 px-3">
                          {fmtDate(c.applicationDate || c.createdAt)}
                        </td>
                        <td className="py-2 px-3 capitalize">
                          {c.paymentStatus || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom pagination only for NON-Explore */}
            <div className="flex items-center gap-3 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
              <select
                className="ml-2 px-2 py-1 border rounded text-sm"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value || "10", 10));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* -------- EXPLORE (2x2 grid with fixed card size + modal) -------- */}
        {activeTab === "explore" && (
          <>
            {/* Filter row */}
            <div className="max-w-[1100px] mx-auto mt-4 mb-4 flex flex-wrap items-start gap-4">
              <MultiSelectDropdown
                label="Popular"
                options={popularOptions}
                value={popularSel}
                onChange={setPopularSel}
              />
              <MultiSelectDropdown
                label="Regions"
                options={regionOptions}
                value={regionSel}
                onChange={setRegionSel}
              />
              <MultiSelectDropdown
                label="Industries"
                options={industryOptions}
                value={industrySel}
                onChange={setIndustrySel}
              />
              <MultiSelectDropdown
                label="Social Medias"
                options={socialOptions}
                value={socialSel}
                onChange={setSocialSel}
              />
            </div>

            {/* Grid wrapper */}
            <div className="max-w-[1100px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="bg-white rounded-xl p-4 border border-[#E5E5E5] h-[220px] animate-pulse"
                      />
                    ))
                  : (() => {
                      // Always render 4 boxes to preserve layout
                      // ...inside the Explore tab grid...
                      // Calculate start/end for current page
                      const startIdx = (page - 1) * limit;
                      const endIdx = startIdx + limit;
                      const data = filteredExplore.slice(startIdx, endIdx);
                      const toFill = Math.max(0, limit - data.length);
                      const slots = [...data, ...Array(toFill).fill(null)];

                      return slots.map((c, idx) =>
                        c ? (
                          <div
                            key={c._id || idx}
                            className="bg-white rounded-xl p-4 border border-[#E5E5E5] h-[220px] flex flex-col justify-between cursor-pointer hover:shadow-sm transition"
                            onClick={() => openModal(c)}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              openModal(c)
                            }
                            tabIndex={0}
                            role="button"
                          >
                            {/* Brand Name and date */}
                            <div className="flex justify-between items-start">
                              <div className="font-semibold">
                                {c.title || "Campaign Name"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {timeAgo(c.createdAt || c.startDate)}
                              </div>
                            </div>
                            {/* Campaign description */}
                            <p className="text-sm text-gray-700 mt-1">
                              {c.description ||
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis."}
                            </p>
                            {/* Target Audience chips */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {(Array.isArray(c.targetAudience)
                                ? c.targetAudience
                                : []
                              ).map((aud, i) => (
                                <span
                                  key={aud + i}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F4F2FF] border border-[#D0CEFF]"
                                >
                                  {aud}
                                </span>
                              ))}
                            </div>
                            {/* Footer actions */}
                            <div className="flex items-center justify-between mt-4">
                              <a
                                className="text-xs underline underline-offset-2"
                                href={c.link || "#"}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Campaign Link ↗
                              </a>
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-3 py-1.5 text-sm border rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewDetails(c);
                                  }}
                                >
                                  View Details
                                </button>
                                <button
                                  className="px-3 py-1.5 text-sm rounded-md"
                                  style={{
                                    border: "1px solid #E5E5E5",
                                    background: "#FFF6F1",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyToCampaign(c._id);
                                  }}
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={`ph-${idx}`}
                            className="bg-white rounded-xl p-4 border border-[#E5E5E5] h-[220px] opacity-60"
                          />
                        )
                      );
                    })()}
              </div>

              {/* Pagination for Explore only */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm">
                  Page {page} / {Math.max(1, Math.ceil(total / limit))}
                </span>
                <button
                  disabled={page >= Math.max(1, Math.ceil(total / limit))}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>

                <select
                  className="ml-2 px-2 py-1 border rounded text-sm"
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value || "10", 10));
                    setPage(1);
                  }}
                >
                  {[4, 8, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* -------- APPLIED (card list like the reference) -------- */}
        {activeTab === "applied" && (
          <>
            <div className="space-y-4">
              {loading ? (
                // skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="h-[120px] bg-white border rounded-xl animate-pulse"
                  />
                ))
              ) : rows.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No applied campaigns yet.
                </div>
              ) : (
                rows.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-xl border p-4"
                    style={{ borderColor: "#E5E5E5" }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo box (use your real logo if available) */}
                      <div className="w-[88px] h-[88px] rounded-lg border bg-gray-50 flex items-center justify-center text-gray-400">
                        {/* <img src={c.brandLogo} alt="" className="w-full h-full object-cover rounded-lg" /> */}
                        <span>Logo</span>
                      </div>

                      {/* 4-column info, matches the mock */}
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        {/* Brand & Campaign */}
                        <div className="col-span-5">
                          <div className="font-semibold">
                            {c.brandName || "Brand Name"}
                          </div>
                          <div className="text-gray-700">
                            {c.title || c.campaignName || "Campaign Name"}
                          </div>
                        </div>

                        {/* Deliverables + Platform */}
                        <div className="col-span-3 text-sm">
                          <div className="text-gray-500">
                            Deliverables:{" "}
                            <span className="text-gray-700">
                              {c.deliverables || c.tasks || "1 Reel, 1 story"}
                            </span>
                          </div>
                          <div className="text-gray-500 mt-1">
                            Platform:{" "}
                            <span className="text-gray-700">
                              {c.platform ||
                                (Array.isArray(c.socials)
                                  ? c.socials.join(", ")
                                  : c.social) ||
                                "Instagram"}
                            </span>
                          </div>
                        </div>

                        {/* Payout */}
                        <div className="col-span-2 text-sm">
                          <div className="text-gray-500">Payout:</div>
                          <div className="text-gray-700">
                            {c.payout || c.rate || c.budget
                              ? `${c.payout || c.rate || c.budget}/post`
                              : "-"}
                          </div>
                        </div>

                        {/* Applied date */}
                        <div className="col-span-2 text-sm">
                          <div className="text-gray-500">Applied on:</div>
                          <div className="text-gray-700">
                            {(() => {
                              const d =
                                c.appliedAt || c.applicationDate || c.createdAt;
                              if (!d) return "-";
                              return new Date(d).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination (only for Applied) */}
            <div className="flex items-center gap-3 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {page} / {Math.max(1, Math.ceil(total / limit))}
              </span>
              <button
                disabled={page >= Math.max(1, Math.ceil(total / limit))}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
              <select
                className="ml-2 px-2 py-1 border rounded text-sm"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value || "10", 10));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* ======= Modal: Campaign Details ======= */}
      {showModal && activeCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

          {/* Dialog */}
          <div
            className="relative z-10 w-[92vw] max-w-[720px] bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-gray-500 hover:text-black"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                  <span className="text-sm">Logo</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-lg">
                        {activeCampaign.brandName || "Brand Name"}
                      </div>
                      <a
                        href={activeCampaign.website || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gray-600 underline underline-offset-2"
                      >
                        {activeCampaign.website || "brandwebsitelink.com"}
                      </a>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Expires on{" "}
                      {(() => {
                        const d =
                          activeCampaign.expiresAt ||
                          activeCampaign.endDate ||
                          null;
                        if (!d) return "—";
                        return new Date(d).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <br></br>
              {/* Add campaign name and description here */}
              <div className="mb-2">
                <div className="font-semibold text-xl">
                  {activeCampaign.title || "Campaign Name"}
                </div>
                <div className="text-gray-700 text-sm mt-1">
                  {activeCampaign.description || "No description available."}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(Array.isArray(activeCampaign.targetAudience)
                  ? activeCampaign.targetAudience
                  : []
                ).map((aud, i) => (
                  <span
                    key={aud + i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#F4F2FF] border border-[#D0CEFF]"
                  >
                    {aud}
                  </span>
                ))}

                {(activeCampaign.budget || activeCampaign.rate) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#E8FFE8] border border-[#BFF3BF]">
                    {activeCampaign.rate || activeCampaign.budget}
                  </span>
                )}

                {(() => {
                  const socials = Array.isArray(activeCampaign.socials)
                    ? activeCampaign.socials
                    : [activeCampaign.social || activeCampaign.platform].filter(
                        Boolean
                      );
                  return socials.map((s, i) => {
                    const low = String(s).toLowerCase();
                    return (
                      <span
                        key={`${s}-${i}`}
                        title={s}
                        className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#F4F2FF] border border-[#D0CEFF]"
                      >
                        {low.includes("insta")
                          ? "📸"
                          : low.includes("you")
                          ? "▶️"
                          : "🔗"}
                      </span>
                    );
                  });
                })()}
              </div>
              {/* Details box */}
              <div
                className="mt-4 rounded-xl border p-4 bg-white"
                style={{ borderColor: "#E5E5E5" }}
              >
                <div className="font-medium mb-2">Campaign Details</div>
                <div className="text-sm text-gray-700 space-y-3">
                  <p>
                    {activeCampaign.details ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis."}
                  </p>
                  {activeCampaign.notes && <p>{activeCampaign.notes}</p>}
                </div>
              </div>
              {/* Footer */}
              <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Updated on{" "}
                  {new Date(
                    activeCampaign.updatedAt ||
                      activeCampaign.createdAt ||
                      Date.now()
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                <button
                  className="px-4 py-1.5 text-sm rounded-md"
                  style={{ border: "1px solid #E5E5E5", background: "#FFF6F1" }}
                  onClick={() => applyToCampaign(activeCampaign._id)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
