"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

/* ===== API config (env-based, absolute) ===== */
function cleanBase(base) {
  const b = (base || "http://localhost:5000").replace(/\/+$/, "");
  try {
    const u = new URL(b.includes("://") ? b : `http://${b}`);
    return u.origin;
  } catch {
    return "http://localhost:5000";
  }
}
const API_BASE = cleanBase(process.env.NEXT_PUBLIC_API_BASE);

// Change this path if your backend route is different
const ENDPOINTS = {
  COMMERCIALS: `${API_BASE}/api/profile/commercials`,
};

function authHeaders(extra = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/* ===== Data ===== */
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
  const [tab, setTab] = useState("Instagram"); // Instagram / Youtube
  const [service, setService] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);
  const [rate, setRate] = useState("");
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const addService = () => {
    if (!service) return alert("Please select a service");
    const num = Number(rate);
    if (!rate || isNaN(num) || num <= 0)
      return alert("Please enter a valid rate");
    // optional: prevent duplicates of same service
    if (services.some((s) => s.service === service)) {
      return alert("This service is already added");
    }
    setServices((prev) => [...prev, { service, rate: num }]);
    setService("");
    setRate("");
  };

  const removeService = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (services.length === 0) {
      return alert("Please add at least one service");
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(ENDPOINTS.COMMERCIALS, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          platform: tab.toLowerCase(), // "instagram" | "youtube"
          services,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(data.message || `${tab} commercials updated`);
      } else {
        setMessage(data.error || data.message || "Something went wrong");
      }
    } catch {
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* ===== Header with shadow lines ===== */}
      <div className="bg-white">
        {/* Row 1: Commercials title */}
        <div
          className="h-[50px] flex items-center"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <h2 className="text-lg font-bold ml-6">Commercials</h2>
        </div>

        {/* Row 2: Tabs */}
        <div
          className="flex items-end gap-6 pl-6 h-[50px]"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          {["Instagram", "Youtube"].map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-0 py-0 text-sm font-semibold border-b-[3px] ${
                  active
                    ? "border-[#F16623] text-black"
                    : "border-transparent text-gray-500"
                }`}
                style={{
                  background: "none",
                  lineHeight: 1.2,
                  paddingBottom: 6,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Form Area ===== */}
      <div className="px-8 md:px-10 py-8">
        <form onSubmit={handleSubmit} className="bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            {/* Services (custom select with down icon) */}
            <div className="relative">
              <label className="block mb-1 text-sm font-semibold">
                Services
              </label>
              <button
                type="button"
                onClick={() => setServiceOpen((o) => !o)}
                className="w-full px-4 py-2 rounded-[10px] border border-gray-300 bg-white text-sm flex items-center justify-between"
                style={{ minHeight: 40 }}
                aria-haspopup="listbox"
                aria-expanded={serviceOpen}
              >
                <span className="truncate">
                  {service ? service : "-select services-"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    serviceOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {serviceOpen && (
                <div
                  role="listbox"
                  className="absolute z-10 mt-1 w-full bg-white border rounded shadow-xl max-h-64 overflow-y-auto"
                >
                  {servicesList.map((s) => (
                    <div
                      key={s}
                      role="option"
                      aria-selected={service === s}
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
                type="number"
                min="0"
                step="1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-4 py-2 rounded-[10px] border border-gray-300 bg-white text-sm placeholder-gray-400"
                placeholder="Rate"
              />
            </div>
          </div>

          {/* Add button */}
          <div className="flex justify-start mb-6">
            <button
              type="button"
              onClick={addService}
              className="bg-[#3A36DB] hover:bg-[#2f2ac2] text-white px-6 py-2 rounded-md text-sm font-semibold"
            >
              Add Service
            </button>
          </div>

          {/* Services table */}
          {services.length > 0 && (
            <div className="mb-6">
              <table className="min-w-full bg-white border rounded-md text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Service</th>
                    <th className="p-2 text-left">Rate</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{s.service}</td>
                      <td className="p-2">₹{s.rate}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => removeService(i)}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Save button */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F16623] hover:bg-[#d95312] text-white px-10 py-2 rounded-md font-semibold text-base disabled:opacity-50"
            >
              {loading ? "Saving..." : "SAVE"}
            </button>
            {message && (
              <p className="text-sm font-medium text-gray-700">{message}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
