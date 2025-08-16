// app/signup/influencer/dashboard/media-kit/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ==================== Config ==================== */
// Use relative path so you can add a Next.js rewrite to avoid CORS in dev.
const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
const MEDIA_KIT_BASE = `${API_ROOT}/api/influencer/media-kit`;

/* ==================== Auth helper ==================== */
function token() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("authToken") || localStorage.getItem("token") || null
  );
}

/* ==================== Utils / Validation ==================== */
const isValidUrl = (v) => {
  if (!v) return false;
  try {
    const u = new URL(v);
    return !!u.protocol && !!u.hostname;
  } catch {
    return false;
  }
};
const isValidEmail = (v) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => !!v && /^\+?[0-9\s\-().]{7,15}$/.test(v);
const isPositive = (n) => Number.isFinite(Number(n)) && Number(n) >= 0;

function hostnameFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

const TABS = [
  { key: "accounts", label: "Accounts" },
  { key: "about", label: "About me" },
  { key: "contact", label: "Contact Details" },
  { key: "links", label: "Additional links" },
  { key: "rates", label: "My Rates" },
  { key: "collabs", label: "My collaborations" },
];

/* ==================== Page ==================== */
export default function MediaKitPage() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("list"); // 'list' | 'editor'
  const [activeTab, setActiveTab] = useState("accounts");
  const [editingId, setEditingId] = useState(null);

  // Accounts tab — click to see detailed layout (like your screenshot)
  const [showAccountDetail, setShowAccountDetail] = useState(false);

  const [form, setForm] = useState({
    account: {
      id: "userid_1",
      platform: "instagram",
      username: "Userid",
      audience: 10000,
    },
    aboutMe: "",
    contact: { phone: "", email: "", customLink: "" },
    links: [{ title: "", url: "" }],
    rates: [{ service: "", price: "" }],
    collaborations: [{ contentUrl: "", brand: "" }],
  });

  const [errors, setErrors] = useState({}); // field-level errors

  /* ==================== Validation ==================== */
  function validateAbout(f) {
    const errs = {};
    if (!f.aboutMe || f.aboutMe.trim().length < 10) {
      errs.aboutMe = "Please write at least 10 characters.";
    } else if (f.aboutMe.length > 500) {
      errs.aboutMe = "Keep it under 500 characters.";
    }
    return errs;
  }

  function validateContact(f) {
    const errs = { contact: {} };
    if (f.contact.email && !isValidEmail(f.contact.email))
      errs.contact.email = "Invalid email.";
    if (f.contact.phone && !isValidPhone(f.contact.phone))
      errs.contact.phone = "Invalid phone.";
    if (f.contact.customLink && !isValidUrl(f.contact.customLink))
      errs.contact.customLink = "Invalid URL.";
    if (!Object.keys(errs.contact).length) return {};
    return errs;
  }

  function validateLinks(f) {
    const arrErrs = (f.links || []).map((row) => {
      const e = {};
      if (row.title && row.title.length > 60) e.title = "Title too long.";
      if (row.url && !isValidUrl(row.url)) e.url = "Invalid URL.";
      return e;
    });
    const any = arrErrs.some((x) => Object.keys(x).length);
    return any ? { links: arrErrs } : {};
  }

  function validateRates(f) {
    const arrErrs = (f.rates || []).map((r) => {
      const e = {};
      if (r.service && r.service.length > 80)
        e.service = "Service name too long.";
      if (r.price !== "" && !isPositive(r.price))
        e.price = "Price must be ≥ 0.";
      return e;
    });
    const any = arrErrs.some((x) => Object.keys(x).length);
    return any ? { rates: arrErrs } : {};
  }

  function validateCollabs(f) {
    const arrErrs = (f.collaborations || []).map((c) => {
      const e = {};
      if (c.contentUrl && !isValidUrl(c.contentUrl))
        e.contentUrl = "Invalid post link.";
      if (c.brand && c.brand.length > 80) e.brand = "Brand name too long.";
      return e;
    });
    const any = arrErrs.some((x) => Object.keys(x).length);
    return any ? { collaborations: arrErrs } : {};
  }

  function mergeErrs(...parts) {
    return parts.reduce((acc, cur) => ({ ...acc, ...cur }), {});
  }

  const validateAll = (f) =>
    mergeErrs(
      validateAbout(f),
      validateContact(f),
      validateLinks(f),
      validateRates(f),
      validateCollabs(f)
    );

  const validateTab = (tab, f) => {
    switch (tab) {
      case "about":
        return validateAbout(f);
      case "contact":
        return validateContact(f);
      case "links":
        return validateLinks(f);
      case "rates":
        return validateRates(f);
      case "collabs":
        return validateCollabs(f);
      default:
        return {};
    }
  };

  const hasAnyError = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    return Object.values(obj).some((v) =>
      v && typeof v === "object" ? hasAnyError(v) : !!v
    );
  };

  /* ==================== API ==================== */
  async function fetchKits() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(MEDIA_KIT_BASE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`GET ${MEDIA_KIT_BASE} → ${res.status}`);
      const data = await res.json();
      setKits(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load media kits.");
      setKits([]);
    } finally {
      setLoading(false);
    }
  }

  async function createKit() {
    const allErrs = validateAll(form);
    setErrors(allErrs);
    if (hasAnyError(allErrs)) {
      // jump to first tab that has errors
      for (const t of ["about", "contact", "links", "rates", "collabs"]) {
        if (hasAnyError(validateTab(t, form))) {
          setActiveTab(t);
          break;
        }
      }
      return;
    }

    setCreating(true);
    setError("");
    try {
      const payload = {
        aboutMe: form.aboutMe.trim(),
        contact: {
          email: form.contact.email || "",
          phone: form.contact.phone || "",
          customLink: form.contact.customLink || "",
        },
        links: (form.links || []).filter((x) => x.title || x.url),
        rates: (form.rates || [])
          .filter((x) => x.service || x.price !== "")
          .map((x) => ({ service: x.service, price: Number(x.price || 0) })),
        collaborations: (form.collaborations || []).filter(
          (x) => x.contentUrl || x.brand
        ),
        account: form.account,
      };

      const res = await fetch(MEDIA_KIT_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(
          `POST ${MEDIA_KIT_BASE} → ${res.status}: ${t || res.statusText}`
        );
      }
      await fetchKits();
      setMode("list");
    } catch (e) {
      setError(e.message || "Failed to create media kit.");
    } finally {
      setCreating(false);
    }
  }

  async function updateKit() {
    if (!editingId) return;

    const allErrs = validateAll(form);
    setErrors(allErrs);
    if (hasAnyError(allErrs)) {
      for (const t of ["about", "contact", "links", "rates", "collabs"]) {
        if (hasAnyError(validateTab(t, form))) {
          setActiveTab(t);
          break;
        }
      }
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        aboutMe: form.aboutMe.trim(),
        contact: {
          email: form.contact.email || "",
          phone: form.contact.phone || "",
          customLink: form.contact.customLink || "",
        },
        links: (form.links || []).filter((x) => x.title || x.url),
        rates: (form.rates || [])
          .filter((x) => x.service || x.price !== "")
          .map((x) => ({ service: x.service, price: Number(x.price || 0) })),
        collaborations: (form.collaborations || []).filter(
          (x) => x.contentUrl || x.brand
        ),
        account: form.account,
      };

      const res = await fetch(`${MEDIA_KIT_BASE}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(
          `PUT ${MEDIA_KIT_BASE}/${editingId} → ${res.status}: ${
            t || res.statusText
          }`
        );
      }
      await fetchKits();
      setMode("list");
    } catch (e) {
      setError(e.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteKit(id) {
    if (!id) return;
    if (!confirm("Remove Media Kit?")) return;
    setError("");
    try {
      const res = await fetch(`${MEDIA_KIT_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(
          `DELETE ${MEDIA_KIT_BASE}/${id} → ${res.status}: ${
            t || res.statusText
          }`
        );
      }
      setKits((prev) => prev.filter((k) => (k._id || k.id) !== id));
    } catch (e) {
      setError(e.message || "Failed to delete media kit.");
    }
  }

  useEffect(() => {
    fetchKits();
  }, []);

  /* ==================== Header ==================== */
  const header = (
    <div
      className="
        relative z-10
        flex items-center h-[50px] bg-white px-6
        border-b border-[#E0E0E0]
        shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]
      "
      style={{ boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)" }}
    >
      <h1 className="pl-10 font-semibold text-[24px] leading-none">
        Media Kit
      </h1>
    </div>
  );

  /* ==================== Tabs bar ==================== */
  const Tabbar = () => (
    <div className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative py-3 text-sm font-semibold ${
                activeTab === t.key ? "text-black" : "text-gray-600"
              }`}
            >
              {t.label}
              {activeTab === t.key && (
                <span className="absolute -bottom-px left-0 right-0 h-[3px] bg-[#F16623] rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ContentShell = ({ children }) => (
    <div className="px-4 py-8 min-h-[520px]">{children}</div>
  );

  /* ==================== Accounts tab (with detail view) ==================== */
  const TabAccounts = () => (
    <ContentShell>
      {!showAccountDetail ? (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center text-xl font-semibold mb-1">
            Select Account
          </h3>
          <p className="text-center text-sm text-gray-600 mb-6">
            Choose which account you want to display in your media kit
          </p>

          <button
            onClick={() => setShowAccountDetail(true)}
            className="w-full text-left bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#000" />
                  <path d="M4 20c2-3 5-4 8-4s6 1 8 4" stroke="#000" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">
                  {form.account?.username || "Userid"}
                </span>
                <span className="text-xs text-[#ff3a5e]">Instagram</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked
              readOnly
              className="w-5 h-5 accent-[#F16623]"
            />
          </button>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setActiveTab("about")}
              className="px-8 py-2 rounded-md text-white font-semibold"
              style={{ background: "#F16623" }}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left profile card */}
            <div className="col-span-1 bg-white border rounded-xl p-6">
              <div className="w-20 h-20 rounded-full border flex items-center justify-center mx-auto">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#000" />
                  <path d="M4 20c2-3 5-4 8-4s6 1 8 4" stroke="#000" />
                </svg>
              </div>
              <div className="text-center mt-4">
                <div className="font-medium">Username</div>
                <div className="text-xs text-gray-500">10k total audience</div>
              </div>
              <button
                className="w-full mt-4 py-2 rounded-md text-white font-semibold"
                style={{ background: "#F16623" }}
                onClick={() => alert("Full report coming soon")}
              >
                See Full Report
              </button>

              <div className="mt-6">
                <div className="font-semibold mb-2">My Social Accounts</div>
                <div className="bg-white border rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <span className="text-[#ff3a5e]">●</span>
                  Instagram
                </div>
              </div>
            </div>

            {/* Right stat tiles */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-4 text-xs text-gray-500">
                Followers
              </div>
              <div className="bg-white border rounded-xl p-4 text-xs text-gray-500">
                Engagement Rate…
              </div>
              <div className="bg-white border rounded-xl p-4 text-xs text-gray-500">
                Average Likes
              </div>
              <div className="bg-white border rounded-xl p-4 text-xs text-gray-500">
                Average Comments
              </div>
              <div className="col-span-2 bg-white border rounded-xl p-4 text-sm">
                <div className="font-semibold mb-2">Most Engaging Content</div>
                <div className="text-gray-500 text-xs">
                  Add your best posts here.
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              className="px-5 py-2 border rounded-md"
              onClick={() => setShowAccountDetail(false)}
            >
              Back
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className="px-8 py-2 rounded-md text-white font-semibold"
              style={{ background: "#F16623" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </ContentShell>
  );

  /* ==================== About tab ==================== */
  const TabAbout = () => (
    <ContentShell>
      <div className="max-w-3xl mx-auto">
        <h3 className="text-center text-xl font-semibold mb-1">
          Tell us who you are
        </h3>
        <p className="text-center text-sm text-gray-600 mb-6">
          Craft a quick personal pitch to share with potential brand partners.
        </p>
        <textarea
          value={form.aboutMe}
          onChange={(e) => setForm((f) => ({ ...f, aboutMe: e.target.value }))}
          placeholder="Share a little about yourself…"
          className={`w-full bg-white border rounded-xl p-3 min-h-[140px] outline-none ${
            errors.aboutMe ? "border-red-500" : ""
          }`}
        />
        {errors.aboutMe && (
          <p className="text-xs text-red-600 mt-1">{errors.aboutMe}</p>
        )}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              const e = validateAbout(form);
              setErrors((prev) => ({ ...prev, ...e }));
              if (!hasAnyError(e)) setActiveTab("contact");
            }}
            className="px-8 py-2 rounded-md text-white font-semibold"
            style={{ background: "#F16623" }}
          >
            Next
          </button>
        </div>
      </div>
    </ContentShell>
  );

  /* ==================== Contact tab ==================== */
  const TabContact = () => (
    <ContentShell>
      <div className="max-w-3xl mx-auto">
        <h3 className="text-center text-xl font-semibold mb-1">
          Share your contact info
        </h3>
        <p className="text-center text-sm text-gray-600 mb-6">
          This will allow brands to reach out to you about possible
          collaborations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm block mb-1">Custom Link</label>
            <input
              type="text"
              value={form.contact.customLink}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contact: { ...f.contact, customLink: e.target.value },
                }))
              }
              placeholder="Create a custom link"
              className={`w-full bg-white border rounded-xl p-3 outline-none ${
                errors?.contact?.customLink ? "border-red-500" : ""
              }`}
            />
            {errors?.contact?.customLink && (
              <p className="text-xs text-red-600 mt-1">
                {errors.contact.customLink}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm block mb-1">Phone</label>
            <input
              type="text"
              value={form.contact.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contact: { ...f.contact, phone: e.target.value },
                }))
              }
              placeholder="Enter your phone"
              className={`w-full bg-white border rounded-xl p-3 outline-none ${
                errors?.contact?.phone ? "border-red-500" : ""
              }`}
            />
            {errors?.contact?.phone && (
              <p className="text-xs text-red-600 mt-1">
                {errors.contact.phone}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm block mb-1">Email</label>
            <input
              type="email"
              value={form.contact.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contact: { ...f.contact, email: e.target.value },
                }))
              }
              placeholder="Enter your email"
              className={`w-full bg-white border rounded-xl p-3 outline-none ${
                errors?.contact?.email ? "border-red-500" : ""
              }`}
            />
            {errors?.contact?.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.contact.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              const e = validateContact(form);
              setErrors((prev) => ({ ...prev, ...e }));
              if (!hasAnyError(e)) setActiveTab("links");
            }}
            className="px-8 py-2 rounded-md text-white font-semibold"
            style={{ background: "#F16623" }}
          >
            Next
          </button>
        </div>
      </div>
    </ContentShell>
  );

  /* ==================== Links tab ==================== */
  const TabLinks = () => (
    <ContentShell>
      <div className="max-w-3xl mx-auto">
        <h3 className="text-center text-xl font-semibold mb-1">
          Additional Links
        </h3>
        <p className="text-center text-sm text-gray-600 mb-6">
          Share links to your other social media accounts or websites
        </p>

        {(form.links || []).map((row, i) => {
          const rowErr = errors?.links?.[i] || {};
          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={row.title}
                onChange={(e) => {
                  const next = [...form.links];
                  next[i] = { ...next[i], title: e.target.value };
                  setForm((f) => ({ ...f, links: next }));
                }}
                placeholder="Title"
                className={`w-full bg-white border rounded-xl p-3 outline-none ${
                  rowErr.title ? "border-red-500" : ""
                }`}
              />
              {rowErr.title && (
                <p className="text-xs text-red-600 -mt-2">{rowErr.title}</p>
              )}

              <input
                type="text"
                value={row.url}
                onChange={(e) => {
                  const next = [...form.links];
                  next[i] = { ...next[i], url: e.target.value };
                  setForm((f) => ({ ...f, links: next }));
                }}
                placeholder="Enter Link…"
                className={`w-full bg-white border rounded-xl p-3 outline-none ${
                  rowErr.url ? "border-red-500" : ""
                }`}
              />
              {rowErr.url && (
                <p className="text-xs text-red-600 -mt-2">{rowErr.url}</p>
              )}
            </div>
          );
        })}
        <button
          className="px-3 py-1 border rounded-md"
          onClick={() =>
            setForm((f) => ({
              ...f,
              links: [...(f.links || []), { title: "", url: "" }],
            }))
          }
        >
          +
        </button>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              const e = validateLinks(form);
              setErrors((prev) => ({ ...prev, ...e }));
              if (!hasAnyError(e)) setActiveTab("rates");
            }}
            className="px-8 py-2 rounded-md text-white font-semibold"
            style={{ background: "#F16623" }}
          >
            Next
          </button>
        </div>
      </div>
    </ContentShell>
  );

  /* ==================== Rates tab ==================== */
  const TabRates = () => (
    <ContentShell>
      <div className="max-w-3xl mx-auto">
        <h3 className="text-center text-xl font-semibold mb-1">Add Rates</h3>
        <p className="text-center text-sm text-gray-600 mb-6">
          List your charges for brand collaborations or sponsorships.
        </p>

        {(form.rates || []).map((row, i) => {
          const rowErr = errors?.rates?.[i] || {};
          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={row.service}
                onChange={(e) => {
                  const next = [...form.rates];
                  next[i] = { ...next[i], service: e.target.value };
                  setForm((f) => ({ ...f, rates: next }));
                }}
                placeholder="Enter type of content…"
                className={`w-full bg-white border rounded-xl p-3 outline-none ${
                  rowErr.service ? "border-red-500" : ""
                }`}
              />
              {rowErr.service && (
                <p className="text-xs text-red-600 -mt-2">{rowErr.service}</p>
              )}
              <input
                type="number"
                value={row.price}
                onChange={(e) => {
                  const next = [...form.rates];
                  next[i] = { ...next[i], price: e.target.value };
                  setForm((f) => ({ ...f, rates: next }));
                }}
                placeholder="Enter rate…"
                className={`w-full bg-white border rounded-xl p-3 outline-none ${
                  rowErr.price ? "border-red-500" : ""
                }`}
              />
              {rowErr.price && (
                <p className="text-xs text-red-600 -mt-2">{rowErr.price}</p>
              )}
            </div>
          );
        })}
        <button
          className="px-3 py-1 border rounded-md"
          onClick={() =>
            setForm((f) => ({
              ...f,
              rates: [...(f.rates || []), { service: "", price: "" }],
            }))
          }
        >
          +
        </button>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              const e = validateRates(form);
              setErrors((prev) => ({ ...prev, ...e }));
              if (!hasAnyError(e)) setActiveTab("collabs");
            }}
            className="px-8 py-2 rounded-md text-white font-semibold"
            style={{ background: "#F16623" }}
          >
            Next
          </button>
        </div>
      </div>
    </ContentShell>
  );

  /* ==================== Collaborations tab ==================== */
  const TabCollabs = () => (
    <ContentShell>
      <div className="max-w-3xl mx-auto">
        <h3 className="text-center text-xl font-semibold mb-1">
          Add Brand Collaborations
        </h3>
        <p className="text-center text-sm text-gray-600 mb-6">
          Choose your top-performing Instagram posts to showcase to brands.
        </p>

        {(form.collaborations || []).map((row, i) => {
          const rowErr = errors?.collaborations?.[i] || {};
          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={row.contentUrl}
                onChange={(e) => {
                  const next = [...form.collaborations];
                  next[i] = { ...next[i], contentUrl: e.target.value };
                  setForm((f) => ({ ...f, collaborations: next }));
                }}
                placeholder="Add post link"
                className={`w-full bg-white border rounded-xl p-3 outline-none ${
                  rowErr.contentUrl ? "border-red-500" : ""
                }`}
              />
              {rowErr.contentUrl && (
                <p className="text-xs text-red-600 -mt-2">
                  {rowErr.contentUrl}
                </p>
              )}

              <input
                type="text"
                value={row.brand}
                onChange={(e) => {
                  const next = [...form.collaborations];
                  next[i] = { ...next[i], brand: e.target.value };
                  setForm((f) => ({ ...f, collaborations: next }));
                }}
                placeholder="Collaborated brand name"
                className={`w-full bg-white border rounded-xl p-3 outline-none ${
                  rowErr.brand ? "border-red-500" : ""
                }`}
              />
              {rowErr.brand && (
                <p className="text-xs text-red-600 -mt-2">{rowErr.brand}</p>
              )}
            </div>
          );
        })}
        <button
          className="px-3 py-1 border rounded-md"
          onClick={() =>
            setForm((f) => ({
              ...f,
              collaborations: [
                ...(f.collaborations || []),
                { contentUrl: "", brand: "" },
              ],
            }))
          }
        >
          +
        </button>

        <div className="flex justify-center mt-6 gap-3">
          {editingId ? (
            <button
              onClick={updateKit}
              disabled={saving}
              className="px-8 py-2 rounded-md text-white font-semibold disabled:opacity-60"
              style={{ background: "#F16623" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          ) : (
            <button
              onClick={createKit}
              disabled={creating}
              className="px-8 py-2 rounded-md text-white font-semibold disabled:opacity-60"
              style={{ background: "#F16623" }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
          )}
        </div>
      </div>
    </ContentShell>
  );

  /* ==================== Render ==================== */
  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {header}

      {mode === "list" && (
        <div className="bg-[#FFF7F0] min-h-full px-4 py-8">
          <h2 className="text-center text-2xl md:text-3xl font-semibold mb-6">
            Effortlessly create a professional media kit <br />
            to impress brands and partners.
          </h2>

          <div className="flex justify-center mb-6">
            <button
              className="px-8 py-2 rounded-md text-white font-semibold"
              style={{ background: "#F16623" }}
              onClick={() => {
                setEditingId(null);
                setForm({
                  account: {
                    id: "userid_1",
                    platform: "instagram",
                    username: "Userid",
                    audience: 10000,
                  },
                  aboutMe: "",
                  contact: { phone: "", email: "", customLink: "" },
                  links: [{ title: "", url: "" }],
                  rates: [{ service: "", price: "" }],
                  collaborations: [{ contentUrl: "", brand: "" }],
                });
                setActiveTab("accounts");
                setShowAccountDetail(false);
                setErrors({});
                setMode("editor");
              }}
            >
              Create my media kit
            </button>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            {loading && (
              <div className="text-sm text-gray-600">Loading media kits…</div>
            )}
            {!loading && error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>

          {/* Kits */}
          {!loading && !error && (
            <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 mt-4">
              {kits.length === 0 ? (
                <div className="text-gray-600 text-sm">No media kits yet.</div>
              ) : (
                kits.map((k) => {
                  const id = k._id || k.id;
                  const username = k.username || k.userName || "UserName";
                  const views = k.views || k.impressions || "2.1k";
                  const firstLink = k.links?.[0]?.url || "";
                  const displayLink = firstLink
                    ? hostnameFromUrl(firstLink)
                    : "halfprofilelink.com";
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-xl border border-[#CECECE] p-4 w-[300px] flex items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full border flex items-center justify-center">
                        <svg width="28" height="28" fill="none">
                          <circle cx="14" cy="14" r="14" fill="#E0E0E0" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {username}
                          </span>
                          <span className="bg-[#ECE6FD] text-[#7463AB] text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {views} Views
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {displayLink}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            className="text-xs px-3 py-1 border rounded-md hover:bg-gray-50"
                            onClick={() => {
                              setEditingId(id);
                              setForm({
                                account: k.account || {
                                  id: "userid_1",
                                  platform: "instagram",
                                  username: "Userid",
                                  audience: 10000,
                                },
                                aboutMe: k.aboutMe || "",
                                contact: {
                                  email: k.contact?.email || "",
                                  phone: k.contact?.phone || "",
                                  customLink: k.contact?.customLink || "",
                                },
                                links: k.links?.length
                                  ? k.links
                                  : [{ title: "", url: "" }],
                                rates: k.rates?.length
                                  ? k.rates
                                  : [{ service: "", price: "" }],
                                collaborations: k.collaborations?.length
                                  ? k.collaborations
                                  : [{ contentUrl: "", brand: "" }],
                              });
                              setActiveTab("accounts");
                              setShowAccountDetail(false);
                              setErrors({});
                              setMode("editor");
                            }}
                          >
                            Edit media kit
                          </button>
                          <button
                            className="text-xs px-3 py-1 border rounded-md hover:bg-gray-50"
                            onClick={() => {
                              const link = k.publicUrl || firstLink || "";
                              if (!link) return alert("No link available");
                              navigator.clipboard.writeText(link).then(
                                () => alert("Link copied"),
                                () => alert("Copy failed")
                              );
                            }}
                          >
                            Copy link
                          </button>
                          <button
                            className="text-xs px-3 py-1 border rounded-md hover:bg-gray-50"
                            onClick={() => deleteKit(id)}
                          >
                            …
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {mode === "editor" && (
        <div className="pb-10">
          <Tabbar />
          {activeTab === "accounts" && <TabAccounts />}
          {activeTab === "about" && <TabAbout />}
          {activeTab === "contact" && <TabContact />}
          {activeTab === "links" && <TabLinks />}
          {activeTab === "rates" && <TabRates />}
          {activeTab === "collabs" && <TabCollabs />}
        </div>
      )}
    </div>
  );
}

/* ==================== Notes ====================

API base path is **singular**:  /api/influencer/media-kit
If you were calling /api/influncers/... or /api/influencers/..., you'll get 404.

Optional dev proxy (to kill CORS):
// next.config.js
module.exports = {
  async rewrites() {
    return [
      { source: "/api/influencer/:path*", destination: "http://localhost:5000/api/influencer/:path*" },
    ];
  },
};

Then keep MEDIA_KIT_BASE as "/api/influencer/media-kit".
*/
