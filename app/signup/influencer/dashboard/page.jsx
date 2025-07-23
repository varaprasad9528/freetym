"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InfluencerDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const router = useRouter();

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    router.push(
      `/signup/influencer/dashboard/report?platform=${platform.toLowerCase()}`
    );
  };

  return (
    <div className="bg-[#FFF8F0] w-full min-h-screen">
      {/* Top Header */}
      <header className="h-14 bg-black text-white flex items-center justify-center text-sm font-semibold">
        Content Goes Here (if any)
      </header>

      {/* Inner Content */}
      <main className="p-12">
        <h2 className="text-xl font-semibold mb-2">
          Let’s add your account(s)
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          We need this information to review your account and generate your
          initial insights.
        </p>

        {/* Choose platform */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-4">Choose your platform</p>
          <div className="flex gap-6">
            <img
              src="/insta.svg"
              alt="Instagram"
              onClick={() => handlePlatformClick("Instagram")}
              className={`cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg rounded-md ${
                selectedPlatform === "Instagram" ? "opacity-100" : "opacity-70"
              }`}
              style={{ width: "258px", height: "82px" }}
            />

            <img
              src="/youtube.svg"
              alt="YouTube"
              onClick={() => handlePlatformClick("YouTube")}
              className={`cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg rounded-md ${
                selectedPlatform === "YouTube" ? "opacity-100" : "opacity-70"
              }`}
              style={{ width: "258px", height: "82px" }}
            />
          </div>
        </div>

        {/* Account input */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Select account
          </label>
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none"
            />
            <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </main>
    </div>
  );
}
