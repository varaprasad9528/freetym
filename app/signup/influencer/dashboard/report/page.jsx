"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "instagram";
  const userId = "User ID";

  // Reusable platform icon
  const platformIcon = useMemo(() => {
    if (platform === "youtube") {
      return (
        <svg width={20} height={20} viewBox="0 0 40 40" aria-hidden="true">
          <g>
            <rect x="5" y="10" width="30" height="20" rx="6" fill="#FF0000" />
            <polygon points="17,15 27,20 17,25" fill="#fff" />
          </g>
        </svg>
      );
    }

    // Instagram icon
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 40 40"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ig20g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>

        {/* gradient rounded square background */}
        <rect x="0" y="0" width="40" height="40" rx="9" fill="url(#ig20g)" />

        {/* camera outline */}
        <rect
          x="10"
          y="10"
          width="20"
          height="20"
          rx="6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* lens */}
        <circle
          cx="20"
          cy="20"
          r="6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* small dot */}
        <circle cx="28" cy="12" r="2.2" fill="#ffffff" />
      </svg>
    );
  }, [platform]);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header Section */}
      <header
        className="w-full flex items-center justify-between px-6 py-4 bg-white"
        style={{
          boxShadow: "0px 4px 4px 0px #00000040",
        }}
      >
        {/* Center: Welcome message */}
        <h1 className="ml-6 text-sm md:text-base font-medium text-gray-800 text-center">
          <span className="font-bold"> Welcome, User!</span> Let’s accelerate
          your income and growth starting today.
        </h1>
      </header>

      {/* Main content shifted to the right with small gap */}
      <div className="px-14 pl-8 mt-4">
        {/* Top bar */}
        <div className="flex items-center mb-6">
          <span className="flex items-center border border-gray-300 rounded-[12px] px-4 py-1.5 text-[#24292F] font-medium text-base bg-[#F5F7F9]">
            <span className="mr-2 inline-flex">{platformIcon}</span>
            <span className="mr-2">{userId}</span>
          </span>

          <button className="flex items-center text-sm font-medium text-[#24292F] ml-5">
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 22 22"
              className="mr-2"
            >
              <circle
                cx="11"
                cy="11"
                r="10"
                stroke="#C1C1C1"
                strokeWidth="1.4"
              />
              <path
                d="M11 7.5v7M7.5 11h7"
                stroke="#C1C1C1"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            Add Account
          </button>

          <a href="#" className="ml-[34rem] text-sm text-blue-600 underline">
            Leave Feedback
          </a>
        </div>

        {/* Report Loading Card */}
        <div
          className="bg-white mb-6 shadow-md"
          style={{
            maxWidth: "950px",
            width: "950px",
            height: "150px",
            borderRadius: "20px",
            border: "1px solid #CECECE",
            padding: "18px 30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3 className="font-semibold text-lg mb-1">
            Report is being generated
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>This can take a while...</span>
            <span className="ml-2">Explore other features in the meantime</span>
          </div>
          <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-1 mt-2">
            <div
              className="absolute left-0 top-0 h-full bg-[#7F56D9] animate-pulse"
              style={{ width: "45%" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            Processing basic info
          </p>
        </div>

        {/* Performance Card */}
        <div
          className="bg-white mb-6 shadow-md"
          style={{
            maxWidth: "950px",
            width: "950px",
            height: "260px",
            borderRadius: "20px",
            border: "1px solid #CECECE",
            padding: "18px 30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <h3 className="text-[17px] font-semibold mb-2">
            RECENT CONTENT PERFORMANCE vs AVERAGE
          </h3>
          <div className="flex gap-10 border-b border-gray-200 pb-2 mb-5 text-base text-gray-600 font-semibold">
            <span>Content</span>
            <span>Published</span>
            <span>Engagement Rate</span>
          </div>
          <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-[125px] flex items-center justify-center rounded-[12px]">
            <div className="flex flex-col items-center">
              <span className="text-gray-700 mb-4 text-[17px] text-center leading-[1.25]">
                See how recent posts in question stacks up against the average
                performance
              </span>
              <button className="bg-orange-500 text-white px-10 py-3 rounded-lg font-bold text-[16px] mt-2 shadow">
                OPEN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
