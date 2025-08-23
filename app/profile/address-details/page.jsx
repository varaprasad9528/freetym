"use client";
import { useEffect, useMemo, useState } from "react";

/* ========= Config (env-based absolute URL) ========= */
function cleanBase(base) {
  const b = (base || "http://localhost:5000").replace(/\/+$/, "");
  try {
    const u = new URL(b.includes("://") ? b : `http://${b}`);
    return u.origin; // e.g., http://localhost:5000
  } catch {
    return "http://localhost:5000";
  }
}
const API_BASE = cleanBase(process.env.NEXT_PUBLIC_API_BASE);

const ENDPOINTS = {
  PROFILE: `${API_BASE}/api/profile`, // for GET on mount
  ADDRESS: `${API_BASE}/api/profile/address`, // for PUT on save/update
};

function authHeaders(extra = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

const IN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function AddressDetailsPage() {
  const emptyForm = {
    country: "India",
    state: "",
    city: "",
    pincode: "",
    address: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [lastSaved, setLastSaved] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [err, setErr] = useState("");

  // ---- Load existing address on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setInitialLoading(true);
        setErr("");

        const res = await fetch(ENDPOINTS.PROFILE, {
          method: "GET",
          headers: authHeaders(),
          cache: "no-store",
          mode: "cors",
        });

        const data = await res.json().catch(() => ({}));

        if (!cancelled) {
          if (res.status === 401) {
            setErr(data?.message || "Unauthorized. Please login again.");
            setHasExisting(false);
            setIsEditing(true);
          } else if (res.ok) {
            const addr = data.address || {};

            const filled = {
              country: addr.country || "India",
              state: addr.state || "",
              city: addr.city || "",
              pincode: addr.pincode || "",
              address: addr.fullAddress || "",
            };

            setForm(filled);
            setLastSaved(filled);

            const hasAny =
              addr.state || addr.city || addr.pincode || addr.fullAddress;

            setHasExisting(Boolean(hasAny));
            setIsEditing(!Boolean(hasAny));
          } else if (res.status === 404) {
            setForm(emptyForm);
            setHasExisting(false);
            setIsEditing(true);
          } else {
            setErr(data?.error || data?.message || "Failed to load profile.");
            setHasExisting(false);
            setIsEditing(true);
          }
        }
      } catch {
        if (!cancelled) {
          setErr("Network error while loading profile.");
          setHasExisting(false);
          setIsEditing(true);
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Validation ----
  const errors = useMemo(() => {
    const e = {};
    if (!form.country) e.country = "Country is required.";
    if (!form.state) e.state = "Please select a state/UT.";
    if (!form.city.trim()) e.city = "City is required.";
    else if (!/^[A-Za-z ]{2,50}$/.test(form.city.trim()))
      e.city = "City should contain letters/spaces only (2–50 chars).";
    if (!form.pincode) e.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "Enter a valid 6-digit pincode.";
    if (!form.address.trim()) e.address = "Address is required.";
    else if (form.address.trim().length < 10)
      e.address = "Address should be at least 10 characters.";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));

  // clamp pincode
  const handlePincodeChange = (v) => {
    const next = v.replace(/\D/g, "").slice(0, 6);
    setForm((f) => ({ ...f, pincode: next }));
  };

  // ---- Submit (Create/Update) ----
  const handleSubmit = async () => {
    setTouched({
      country: true,
      state: true,
      city: true,
      pincode: true,
      address: true,
    });
    setMessage("");
    setErr("");
    if (!isValid) return;

    try {
      setLoading(true);
      const res = await fetch(ENDPOINTS.ADDRESS, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          country: form.country,
          state: form.state,
          city: form.city.trim(),
          pincode: form.pincode,
          fullAddress: form.address.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setErr(data?.message || "Unauthorized. Please login again.");
      } else if (res.ok) {
        setMessage(data?.message || "Address updated");
        setLastSaved(form);
        setHasExisting(true);
        setIsEditing(false);
      } else {
        setErr(data?.error || data?.message || "Something went wrong");
      }
    } catch {
      setErr("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setIsEditing(true);
    setMessage("");
    setErr("");
  };

  const cancelEdit = () => {
    setForm(lastSaved);
    setTouched({});
    setIsEditing(false);
    setMessage("");
    setErr("");
  };

  const inputBase =
    "w-full px-4 py-2 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F16623]";
  const labelBase = "block mb-1 text-sm font-semibold";
  const errText = "mt-1 text-xs text-red-600";
  const disabledCls = !isEditing
    ? "bg-gray-100 cursor-not-allowed"
    : "bg-white";

  return (
    <div>
      {/* Header bar */}
      <div
        className="w-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "50px",
          marginBottom: "24px",
        }}
      ></div>

      <div className="px-10 py-2">
        <h2 className="text-lg font-bold mb-10">Address Details</h2>

        {(err || (!isEditing && message)) && (
          <div
            className={`mb-4 text-sm px-3 py-2 rounded border ${
              err
                ? "text-red-700 bg-red-50 border-red-200"
                : "text-green-700 bg-green-50 border-green-200"
            }`}
          >
            {err || message}
          </div>
        )}

        {initialLoading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : (
          <>
            {/* Form only inputs */}
            <form className="max-w-4xl mx-auto" noValidate>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
                {/* Country */}
                <div>
                  <label className={labelBase}>Country</label>
                  <input
                    type="text"
                    value={form.country}
                    readOnly
                    className={`${inputBase} border-gray-300 text-gray-700 bg-gray-100 cursor-not-allowed`}
                  />
                </div>

                {/* State */}
                <div>
                  <label className={labelBase}>State</label>
                  <select
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                    onBlur={() => markTouched("state")}
                    disabled={!isEditing}
                    className={`${inputBase} border-gray-300 ${disabledCls}`}
                  >
                    <option value="">Select State / UT</option>
                    {IN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {touched.state && errors.state && (
                    <p className={errText}>{errors.state}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className={labelBase}>City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    onBlur={() => markTouched("city")}
                    disabled={!isEditing}
                    className={`${inputBase} border-gray-300 ${disabledCls}`}
                    placeholder="e.g., Guntur"
                  />
                  {touched.city && errors.city && (
                    <p className={errText}>{errors.city}</p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className={labelBase}>Pincode</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={form.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    onBlur={() => markTouched("pincode")}
                    disabled={!isEditing}
                    className={`${inputBase} border-gray-300 ${disabledCls}`}
                    placeholder="6-digit pincode"
                  />
                  {touched.pincode && errors.pincode && (
                    <p className={errText}>{errors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-8">
                <label className={labelBase}>Full Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  onBlur={() => markTouched("address")}
                  disabled={!isEditing}
                  className={`${inputBase} border-gray-300 ${disabledCls}`}
                  placeholder="House No., Street, Area, Landmark"
                />
                {touched.address && errors.address && (
                  <p className={errText}>{errors.address}</p>
                )}
              </div>
            </form>

            {/* Buttons moved OUTSIDE */}
            <div className="flex items-center gap-3 mt-6">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !isValid}
                    className="bg-[#F16623] hover:bg-[#d95312] text-white px-8 py-2 rounded-md font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasExisting
                      ? loading
                        ? "Updating..."
                        : "Update"
                      : loading
                      ? "Saving..."
                      : "Save"}
                  </button>
                  {hasExisting && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={startEdit}
                  className="bg-[#3A36DB] hover:bg-[#2f2ac2] text-white px-8 py-2 rounded-md font-semibold text-base"
                >
                  Edit
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
