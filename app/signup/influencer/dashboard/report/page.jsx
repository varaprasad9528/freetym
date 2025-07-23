// app/signup/influencer/dashboard/report/page.jsx
"use client";
import { useSearchParams } from "next/navigation";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || "instagram";

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">
        Welcome, User! Let’s accelerate your income and growth starting today.
      </h2>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={`/${platform}.svg`}
          alt={`${platform} icon`}
          className="w-[40px] h-[40px]"
        />
        <button className="text-sm bg-[#eee] px-4 py-2 rounded-md">
          + Add Account
        </button>
        <a href="#" className="ml-auto text-sm text-blue-600 underline">
          Leave Feedback
        </a>
      </div>

      <div className="bg-white p-4 rounded-lg mb-6 shadow-md">
        <h3 className="font-semibold">Report is being generated</h3>
        <p className="text-sm text-gray-600">
          This can take a while... Explore other features in the meantime
        </p>
        <p className="text-xs text-gray-500 mt-2">Processing basic info ⏳</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold mb-2">
          RECENT CONTENT PERFORMANCE vs AVERAGE
        </h3>
        <div className="bg-gray-200 h-32 flex items-center justify-center rounded-md">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md">
            OPEN
          </button>
        </div>
      </div>
    </div>
  );
}
