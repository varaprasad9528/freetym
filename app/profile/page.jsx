"use client";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ====== Config (uses env) ====== */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"
).replace(/\/+$/, ""); // strip trailing slashes

const ENDPOINTS = {
  PROFILE_GET: `${API_BASE}/api/profile`,
  PROFILE_PUT: `${API_BASE}/api/profile/personal-details`,
};

const relationshipOptions = [
  "Single",
  "In a relationship",
  "Engaged",
  "Married",
  "In a civil union",
  "In a domestic partnership",
  "In an open relationship",
  "It's complicated",
  "Separated",
  "Divorced",
  "Widowed",
];

const nameRegex = /^[A-Za-z\s]+$/;
const today = new Date();

function buildAuthHeaders(extra = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
function toISODate(d) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: null,
    gender: "",
    relationshipStatus: "",
    about: "",
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editMode, setEditMode] = useState(true);

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const hasServerData = useMemo(() => {
    if (!original) return false;
    return Boolean(
      original.firstName ||
        original.lastName ||
        original.dob ||
        original.gender ||
        original.relationshipStatus ||
        original.about
    );
  }, [original]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      setOk("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        console.error("No token provided.");
        setLoading(false);
        return;
      }

      try {
        const r = await fetch(ENDPOINTS.PROFILE_GET, {
          method: "GET",
          headers: buildAuthHeaders(),
        });
        const js = await r.json();

        if (r.status === 401 || js?.message === "No token provided.") {
          console.error("No token provided.");
          setLoading(false);
          return;
        }
        if (!r.ok) {
          setErr(js?.message || "Failed to load profile.");
          setLoading(false);
          return;
        }

        const data = js?.data || js;
        const dobDate = data?.dob ? new Date(data.dob) : null;
        const mapped = {
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          dob: dobDate && !isNaN(dobDate) ? dobDate : null,
          gender: data?.gender || "",
          relationshipStatus: data?.relationshipStatus || "",
          about: data?.about || "",
        };

        setForm(mapped);
        setOriginal(mapped);

        const hasData =
          mapped.firstName ||
          mapped.lastName ||
          mapped.dob ||
          mapped.gender ||
          mapped.relationshipStatus ||
          mapped.about;
        setEditMode(!hasData);
      } catch {
        setErr("Network error while loading profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstNameError = useMemo(() => {
    if (!form.firstName) return "";
    return nameRegex.test(form.firstName)
      ? ""
      : "First name should contain letters and spaces only.";
  }, [form.firstName]);

  const lastNameError = useMemo(() => {
    if (!form.lastName) return "";
    return nameRegex.test(form.lastName)
      ? ""
      : "Last name should contain letters and spaces only.";
  }, [form.lastName]);

  const dobError = useMemo(() => {
    if (!form.dob) return "";
    return form.dob > today ? "Date of birth cannot be in the future." : "";
  }, [form.dob]);

  function buildChangedPayload() {
    const base = original || {
      firstName: "",
      lastName: "",
      dob: null,
      gender: "",
      relationshipStatus: "",
      about: "",
    };
    const payload = {};

    if (form.firstName !== base.firstName && form.firstName.trim())
      payload.firstName = form.firstName.trim();
    if (form.lastName !== base.lastName && form.lastName.trim())
      payload.lastName = form.lastName.trim();

    const baseDobISO = base.dob ? toISODate(new Date(base.dob)) : null;
    const formDobISO = form.dob ? toISODate(form.dob) : null;
    if (formDobISO !== baseDobISO) {
      if (form.dob) payload.dob = formDobISO;
    }

    if (form.gender !== base.gender && form.gender)
      payload.gender = form.gender;
    if (
      form.relationshipStatus !== base.relationshipStatus &&
      form.relationshipStatus
    )
      payload.relationshipStatus = form.relationshipStatus;
    if (form.about !== base.about) payload.about = form.about || "";

    return payload;
  }

  async function onSave(e) {
    e?.preventDefault?.();
    setErr("");
    setOk("");

    if (firstNameError || lastNameError || dobError) {
      setErr("Please fix the validation errors before saving.");
      return;
    }

    const payload = buildChangedPayload();
    if (!Object.keys(payload).length) {
      setOk("No changes to update.");
      if (hasServerData) setEditMode(false);
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      console.error("No token provided.");
      return;
    }

    try {
      setSaving(true);
      const r = await fetch(ENDPOINTS.PROFILE_PUT, {
        method: "PUT",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const js = await r.json();

      if (r.status === 401 || js?.message === "No token provided.") {
        console.error("No token provided.");
        return;
      }
      if (!r.ok) {
        setErr(js?.message || "Failed to update personal details.");
        return;
      }

      setOk(js?.message || "Personal details updated");
      const snap = { ...form };
      setOriginal(snap);
      setEditMode(false);
    } catch {
      setErr("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  function onEdit() {
    setOk("");
    setErr("");
    setEditMode(true);
  }

  function onCancel() {
    if (original) setForm(original);
    setOk("");
    setErr("");
    if (hasServerData) setEditMode(false);
  }

  const disabled = !editMode || saving || loading;

  return (
    <div className="bg-[#FFF8F0] min-h-screen px-0 py-0">
      {/* HEADER */}
      <div
        className="w-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "50px",
          marginBottom: "24px",
        }}
      ></div>

      <main className="px-12 py-4">
        <h2 className="text-xl font-bold mb-7">Account Details</h2>

        {loading ? (
          <div className="text-sm text-gray-600 mb-4">Loading...</div>
        ) : (
          <>
            {err && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {err}
              </div>
            )}
            {ok && (
              <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                {ok}
              </div>
            )}
          </>
        )}

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block mb-1 text-sm font-semibold">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                disabled={disabled}
                className={`w-full px-4 py-2 rounded-md border text-sm ${
                  disabled
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
                placeholder="First name"
              />
              {editMode && firstNameError && (
                <p className="text-xs text-red-500 mt-1">{firstNameError}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                disabled={disabled}
                className={`w-full px-4 py-2 rounded-md border text-sm ${
                  disabled
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
                placeholder="Last name"
              />
              {editMode && lastNameError && (
                <p className="text-xs text-red-500 mt-1">{lastNameError}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold">
                Date of Birth
              </label>
              <DatePicker
                selected={form.dob}
                onChange={(date) => setForm((f) => ({ ...f, dob: date }))}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="Click to select a date"
                maxDate={today}
                customInput={
                  <input
                    disabled={disabled}
                    className={`w-full px-4 py-2 rounded-md border text-sm ${
                      disabled
                        ? "bg-gray-100 border-gray-200"
                        : "bg-white border-gray-300"
                    }`}
                  />
                }
              />
              {editMode && dobError && (
                <p className="text-xs text-red-500 mt-1">{dobError}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold">Gender</label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value }))
                }
                disabled={disabled}
                className={`w-full px-4 py-2 rounded-md border text-sm ${
                  disabled
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">
              Relationship Status
            </label>
            <select
              value={form.relationshipStatus}
              onChange={(e) =>
                setForm((f) => ({ ...f, relationshipStatus: e.target.value }))
              }
              disabled={disabled}
              className={`w-full px-4 py-2 rounded-md border text-sm ${
                disabled
                  ? "bg-gray-100 border-gray-200"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="">Select Relationship</option>
              {relationshipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">About</label>
            <textarea
              rows={3}
              value={form.about}
              onChange={(e) =>
                setForm((f) => ({ ...f, about: e.target.value }))
              }
              disabled={disabled}
              className={`w-full px-4 py-2 rounded-md border text-sm ${
                disabled
                  ? "bg-gray-100 border-gray-200"
                  : "bg-white border-gray-300"
              }`}
              placeholder="Add something about you"
            />
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-center gap-3 mt-2">
            {!hasServerData && editMode && (
              <button
                onClick={onSave}
                className={`px-10 py-2 rounded-md text-white font-semibold ${
                  saving
                    ? "bg-[#F16623]/60 cursor-not-allowed"
                    : "bg-[#F16623] hover:bg-[#d95312]"
                }`}
                disabled={saving || loading}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}

            {hasServerData && !editMode && (
              <button
                onClick={onEdit}
                className="px-10 py-2 rounded-md border border-[#F16623] text-[#F16623] hover:bg-[#FFF1E9] font-semibold"
                disabled={loading}
              >
                Edit
              </button>
            )}

            {hasServerData && editMode && (
              <>
                <button
                  onClick={onCancel}
                  className="px-10 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  className={`px-10 py-2 rounded-md text-white font-semibold ${
                    saving
                      ? "bg-[#F16623]/60 cursor-not-allowed"
                      : "bg-[#F16623] hover:bg-[#d95312]"
                  }`}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
