"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

const tabs = ["Trending Reels", "Saved Reels"];

export default function ReelsInspirationPage() {
  const [activeIdx, setActiveIdx] = useState(0);

  // data
  const [trending, setTrending] = useState([]);
  const [saved, setSaved] = useState([]);

  // loading / error
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // pagination
  const [trendPage, setTrendPage] = useState(1);
  const [trendLimit] = useState(20);
  const [trendPages, setTrendPages] = useState(1);

  const [savedPage, setSavedPage] = useState(1);
  const [savedLimit] = useState(8);
  const [savedPages, setSavedPages] = useState(1);

  // tab indicator
  const tabsRef = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const el = tabsRef.current[activeIdx];
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.clientWidth });
  }, [activeIdx]);

  // helpers
  const authHeader = useMemo(() => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }, []);

  async function fetchTrending() {
    setLoading(true);
    setErr("");
    try {
      // If backend supports page/limit for trending, pass them; if not, this still works.
      const res = await fetch(
        `${API_BASE}/api/reels/trending?page=${trendPage}&limit=${trendLimit}`
      );
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.message || "Failed to load trending reels");
      setTrending(json.data || []);
      setTrendPages(json.pagination?.pages || 1);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSaved() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `${API_BASE}/api/reels/saved?page=${savedPage}&limit=${savedLimit}`,
        {
          headers: { "Content-Type": "application/json", ...authHeader },
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.message || "Failed to load saved reels");
      setSaved(json.data || []);
      setSavedPages(json.pagination?.pages || 1);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(reelId) {
    try {
      const res = await fetch(`${API_BASE}/api/reels/${reelId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      const json = await res.json();
      if (!res.ok || !json?.success)
        throw new Error(json?.message || "Failed to toggle save");

      // Optimistic updates:
      setTrending((prev) =>
        prev.map((r) =>
          r._id === reelId ? { ...r, saved: json.data?.saved } : r
        )
      );
      setSaved((prev) => {
        const isSaved = json.data?.saved;
        if (isSaved) {
          // If we just saved it and it’s not in the list, add it
          const t = trending.find((r) => r._id === reelId);
          if (t && !prev.some((x) => x._id === reelId)) return [t, ...prev];
          return prev;
        } else {
          // If we just removed it, drop from saved list
          return prev.filter((r) => r._id !== reelId);
        }
      });
    } catch (e) {
      alert(e.message || "Failed to save/unsave");
    }
  }

  // fetch based on tab + page
  useEffect(() => {
    if (activeIdx === 0) fetchTrending();
    if (activeIdx === 1) fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, trendPage, savedPage]);

  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* STEP 1: Main Header */}
      <div
        className="flex items-center h-[64px] bg-white px-6 border-b border-[#CECECE]"
        style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
      >
        <h1 className="m-0 font-semibold text-[24px] leading-[100%]">
          Reels Inspiration
        </h1>
      </div>

      {/* STEP 2: Tabs */}
      <div className="relative flex gap-6 border-b border-[#CECECE] bg-white px-6">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            ref={(el) => (tabsRef.current[idx] = el)}
            onClick={() => setActiveIdx(idx)}
            className={`py-3 font-semibold focus:outline-none ${
              activeIdx === idx ? "text-black" : "text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
        <span
          className="absolute bottom-0 h-[3px] bg-[#F16623] rounded-full transition-all duration-200"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>

      {/* Main Content (shifted right a bit) */}
      <div className="pt-4 pr-6 pl-8 md:pl-12 lg:pl-16">
        {/* Filters row (UI only, wire to query params later if needed) */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            "Categories",
            "Language",
            "Followers",
            "Account Type",
            "Last 30 days",
          ].map((f) => (
            <select
              key={f}
              className="border border-[#CECECE] rounded-md px-3 py-1.5 text-sm bg-white"
              defaultValue=""
            >
              <option value="" disabled>
                {f}
              </option>
            </select>
          ))}
        </div>

        {/* Category Pills — 4 columns, icon on top, text below, narrow width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Art & Design", emoji: "🎨" },
            { label: "Beauty & Fashion", emoji: "💅" },
            { label: "Comedy", emoji: "🎬" },
            { label: "DIY & How-To", emoji: "✂️" },
            { label: "Fitness & Wellness", emoji: "💪" },
            { label: "Lifestyle & Vlogs", emoji: "👜" },
            { label: "Motivation", emoji: "📰" },
            { label: "Travel & Nature", emoji: "🌍" },
          ].map((cat) => (
            <button
              key={cat.label}
              className="bg-white border border-[#CECECE] rounded-xl px-4 py-3 text-sm font-semibold flex flex-col items-center justify-center gap-2 w-[150px] mx-auto"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Reels Grid */}
        <section className="mt-6">
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md inline-block">
              {err}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : (
            <ReelsGrid
              reels={activeIdx === 0 ? trending : saved}
              onToggleSave={toggleSave}
              isSavedTab={activeIdx === 1}
            />
          )}

          {/* Pagination */}
          <Pagination
            page={activeIdx === 0 ? trendPage : savedPage}
            pages={activeIdx === 0 ? trendPages : savedPages}
            onPageChange={(p) =>
              activeIdx === 0 ? setTrendPage(p) : setSavedPage(p)
            }
          />
        </section>
      </div>
    </div>
  );
}

function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        className="px-3 py-1.5 text-sm border rounded bg-white disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-sm">
        Page {page} / {pages}
      </span>
      <button
        className="px-3 py-1.5 text-sm border rounded bg-white disabled:opacity-50"
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page >= pages}
      >
        Next
      </button>
    </div>
  );
}

function ReelsGrid({ reels, onToggleSave, isSavedTab }) {
  if (!reels?.length) {
    return <div className="text-sm text-gray-600">No reels found.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pb-10">
      {reels.map((r) => (
        <article
          key={r._id}
          className="relative bg-white rounded-xl border border-[#CECECE] overflow-hidden mx-auto w-[140px] md:w-[150px]"
          title={r.title}
        >
          {/* Viral tag (simple rule: trendingScore high?) */}
          <div className="absolute top-2 left-2 bg-[#FFF0E5] text-[#F16623] text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Viral
          </div>

          {/* Thumbnail */}
          <a href={r.url} target="_blank" rel="noreferrer" className="block">
            <div className="relative pb-[150%] bg-[#F3F4F6]">
              {r.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.thumbnail}
                  alt={r.title || "Reel"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                className="absolute inset-0 m-auto flex items-center justify-center w-9 h-9 bg-white rounded-full border border-gray-300"
              >
                ▶
              </button>
            </div>
          </a>

          {/* Footer: title + metrics + save */}
          <div className="px-2 py-2">
            <p className="text-[11px] font-medium line-clamp-2">{r.title}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] text-gray-600">
              <span>❤ {r.metrics?.likes ?? 0}</span>
              <span>👁 {r.metrics?.views ?? 0}</span>
              <span>💬 {r.metrics?.comments ?? 0}</span>
            </div>

            <button
              onClick={() => onToggleSave(r._id)}
              className={`mt-2 w-full text-xs border rounded px-2 py-1 ${
                isSavedTab || r.saved || (r.savedBy?.length ?? 0) > 0
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {isSavedTab || r.saved || (r.savedBy?.length ?? 0) > 0
                ? "Unsave"
                : "Save"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
