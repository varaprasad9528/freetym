"use client";
import { useState, useRef, useEffect } from "react";

const tabs = ["Trending Reels", "Saved Reels"];

export default function ReelsInspirationPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabsRef.current[activeIdx];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.clientWidth });
    }
  }, [activeIdx]);

  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Header */}
      <div
        className="flex items-center h-[64px] bg-white px-6"
        style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
      >
        <h1
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "100%",
            margin: 0,
            paddingLeft: "40px",
          }}
        >
          Reels Inspiration
        </h1>
      </div>

      {/* Main area */}
      <div className="pt-4 px-6">
        {/* Tabs */}
        <div className="relative flex gap-6 border-b border-[#CECECE] bg-white">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              ref={(el) => (tabsRef.current[idx] = el)}
              onClick={() => setActiveIdx(idx)}
              className="py-3 font-semibold text-black bg-white focus:outline-none"
            >
              {tab}
            </button>
          ))}
          <span
            className="absolute bottom-0 h-[3px] bg-[#F16623] rounded-full transition-all duration-200"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4 bg-white p-3 rounded-md">
          {[
            "Categories",
            "Language",
            "Followers",
            "Account Type",
            "Last 30 days",
          ].map((f) => (
            <select
              key={f}
              className="border border-[#CECECE] rounded-md px-3 py-2 text-sm bg-white"
            >
              <option disabled selected>
                {f}
              </option>
            </select>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            "Art & Design",
            "Beauty & Fashion",
            "Comedy",
            "DIY & How‑To",
            "Fitness & Wellness",
            "Lifestyle & Vlogs",
            "Motivation",
            "Travel & Nature",
          ].map((cat) => (
            <button
              key={cat}
              className="bg-white border border-[#CECECE] rounded-full px-4 py-2 text-xs flex items-center gap-1"
            >
              🎬 {cat}
            </button>
          ))}
        </div>

        {/* Four video cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#CECECE] overflow-hidden w-[150px]"
            >
              <div className="relative pb-[160%] bg-gray-100">
                <button className="absolute inset-0 m-auto flex items-center justify-center w-8 h-8 bg-white rounded-full">
                  ▶️
                </button>
              </div>
              <div className="px-2 py-1 text-center">
                <span className="inline-block bg-[#FFF0E5] text-[#F16623] text-xs font-semibold px-2 py-0.5 rounded-full">
                  Viral
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
