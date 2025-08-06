"use client";
import { useState } from "react";

const servicesList = [
  "Reel",
  "Image Story",
  "Image Post",
  "Video Story",
  "Carousel",
  "Live",
  "UGC Content",
  "Custom Package",
];

export default function CommercialsPage() {
  const [tab, setTab] = useState("Instagram");
  const [service, setService] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);
  const [rate, setRate] = useState("");
  const [rate2, setRate2] = useState("");
  const [addMore, setAddMore] = useState("");

  return (
    <div>
      {/* Header row with title and tabs, all in one line */}
      <div
        className="w-full flex items-end"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "60px",
          borderBottom: "1.5px solid #DCDCDC",
        }}
      >
        <h2 className="text-lg font-bold ml-7 mb-1">Commercials</h2>
        {/* Tabs */}
        <div className="flex ml-14 h-full items-end">
          {["Instagram", "Youtube"].map((t) => (
            <button
              key={t}
              className={`pb-2 px-7 font-semibold text-sm outline-none transition-all relative
                ${tab === t ? "text-black" : "text-gray-500"}
              `}
              style={{
                borderBottom:
                  tab === t ? "3px solid #F16623" : "3px solid transparent",
                background: "none",
                marginRight: "8px",
              }}
              onClick={() => setTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Commercials Form */}
      <div className="px-10 py-10">
        <form
          className="bg-transparent"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
            {/* Services */}
            <div className="relative">
              <label className="block mb-1 text-sm font-semibold">
                Services
              </label>
              <button
                type="button"
                onClick={() => setServiceOpen((o) => !o)}
                className="w-full text-left px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                style={{ minHeight: "40px" }}
              >
                {service ? service : "-select services-"}
              </button>
              {/* Dropdown */}
              {serviceOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-xl max-h-64 overflow-y-auto">
                  {servicesList.map((s) => (
                    <div
                      key={s}
                      onClick={() => {
                        setService(s);
                        setServiceOpen(false);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-orange-100 ${
                        service === s ? "bg-orange-50" : ""
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Rate */}
            <div>
              <label className="block mb-1 text-sm font-semibold">Rate</label>
              <input
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="Rate"
              />
            </div>
            {/* Rate2 */}
            <div>
              <label className="block mb-1 text-sm font-semibold">Rate</label>
              <input
                type="text"
                value={rate2}
                onChange={(e) => setRate2(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="Enter rate"
              />
            </div>
            {/* Add More */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                Add More
              </label>
              <input
                type="text"
                value={addMore}
                onChange={(e) => setAddMore(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm"
                placeholder="Add More"
                disabled
              />
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="bg-[#F16623] hover:bg-[#d95312] text-white px-10 py-2 rounded-md font-semibold text-base"
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
