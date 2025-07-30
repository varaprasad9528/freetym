"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "instagram";
  const userId = "User ID";

  // Platform Icon SVGs (edit as needed)
  const platformIcon = useMemo(() => {
    if (platform === "youtube") {
      // Official YouTube SVG style
      return (
        <svg width={34} height={34} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#fff" />
          <g>
            <rect x="8" y="12" width="32" height="24" rx="6" fill="#FF0000" />
            <polygon points="21,18 32,24 21,30" fill="#fff" />
          </g>
        </svg>
      );
    }
    // Instagram SVG gradient-ish look
    return (
      <svg width={34} height={34} viewBox="0 0 48 48">
        <defs>
          <radialGradient id="ig1" cx="50%" cy="50%" r="85%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="100%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#ig1)" />
        <g>
          <circle
            cx="24"
            cy="24"
            r="8"
            stroke="#fff"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="34" cy="14" r="2" fill="#fff" />
        </g>
      </svg>
    );
  }, [platform]);

  // User icon SVG
  const userIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#8A7FCB">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill="#8A7FCB" />
    </svg>
  );

  return (
    <div className="p-8 bg-[#FFF8F0] min-h-screen">
      <h2 className="text-xl font-semibold mb-4">
        Welcome, <b>User!</b> Let’s accelerate your income and growth starting
        today.
      </h2>

      {/* Top bar: User, platform, add account */}
      <div className="flex items-center gap-5 mb-6">
        {/* User ID pill */}
        <span className="flex items-center border border-gray-300 rounded-[12px] px-4 py-1.5 text-[#24292F] font-medium text-base bg-[#F5F7F9]">
          {/* Platform icon */}
          {platform === "youtube" ? (
            <svg width="20" height="20" viewBox="0 0 40 40" className="mr-2">
              <g>
                <rect
                  x="5"
                  y="10"
                  width="30"
                  height="20"
                  rx="6"
                  fill="#FF0000"
                />
                <polygon points="17,15 27,20 17,25" fill="#fff" />
              </g>
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 448 448"
              className="mr-2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="igGradient" cx="0.35" cy="0.35" r="1">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="45%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="100%" stopColor="#285AEB" />
                </radialGradient>
              </defs>
              <rect width="448" height="448" rx="115" fill="url(#igGradient)" />
              <path
                d="M224 142c-45.5 0-82.5 37-82.5 82.5S178.5 307 224 307s82.5-37 82.5-82.5S269.5 142 224 142zm0 135c-29 0-52.5-23.5-52.5-52.5S195 172 224 172s52.5 23.5 52.5 52.5S253 277 224 277zm85-136.5c0 10-8 18-18 18s-18-8-18-18 8-18 18-18 18 8 18 18zm51 18.5c-1.2-25.6-7-48.2-25.6-66.8C326.2 61 303.6 55.2 278 54c-25.7-1.2-102.7-1.2-128.4 0-25.6 1.2-48.2 7-66.8 25.6C61 121.8 55.2 144.4 54 170c-1.2 25.7-1.2 102.7 0 128.4 1.2 25.6 7 48.2 25.6 66.8C121.8 387 144.4 392.8 170 394c25.7 1.2 102.7 1.2 128.4 0 25.6-1.2 48.2-7 66.8-25.6 18.6-18.6 24.4-41.2 25.6-66.8 1.2-25.7 1.2-102.7 0-128.4zM398 334c-7.8 19.6-23 34.7-42.6 42.6-29.5 11.7-99.5 9-132.9 9s-103.5 2.6-132.9-9c-19.6-7.8-34.7-23-42.6-42.6-11.7-29.5-9-99.5-9-132.9s-2.6-103.5 9-132.9c7.8-19.6 23-34.7 42.6-42.6C121.8 61 191.8 63.6 225.2 63.6s103.5-2.6 132.9 9c19.6 7.8 34.7 23 42.6 42.6 11.7 29.5 9 99.5 9 132.9s2.7 103.5-9 132.9z"
                fill="#fff"
              />
            </svg>
          )}
          <span className="mr-2">User ID</span>
          {/* Info icon */}
          <svg width="18" height="18" viewBox="0 0 20 20" className="ml-2">
            <circle
              cx="10"
              cy="10"
              r="8.5"
              stroke="#C1C1C1"
              strokeWidth="1.2"
              fill="none"
            />
            <text
              x="10"
              y="14"
              textAnchor="middle"
              fontSize="10"
              fill="#C1C1C1"
              fontFamily="Arial"
              fontWeight="bold"
            >
              i
            </text>
          </svg>
        </span>

        {/* Add Account (gray circled plus only once) */}
        <button className="flex items-center text-sm font-medium text-[#24292F] ml-2">
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 22 22"
            className="mr-2"
          >
            <circle cx="11" cy="11" r="10" stroke="#C1C1C1" strokeWidth="1.4" />
            <path
              d="M11 7.5v7M7.5 11h7"
              stroke="#C1C1C1"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          Add Account
        </button>
        <a
          href="#"
          style={{ marginLeft: "500px" }}
          className="text-sm text-blue-600 underline"
        >
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
        {/* Animated loading bar */}
        <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-1 mt-2">
          <div
            className="absolute left-0 top-0 h-full bg-[#7F56D9] animate-pulse"
            style={{ width: "45%" }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <svg width="14" height="14" fill="none" className="mr-1">
            <circle
              cx="7"
              cy="7"
              r="6"
              stroke="#7F56D9"
              strokeWidth="2"
              opacity="0.6"
            />
            <path
              d="M7 3v4l2.5 2.5"
              stroke="#7F56D9"
              strokeWidth="2"
              opacity="0.7"
            />
          </svg>
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
        {/* Tab headers (static) */}
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
  );
}
