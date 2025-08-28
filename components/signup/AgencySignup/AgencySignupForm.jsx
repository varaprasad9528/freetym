// app/(wherever)/AgencySignupPage.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

// ---- Env-based API base (uses NEXT_PUBLIC_API_BASE) ----
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
const API = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

// safe JSON reader
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

const testimonials = [
  {
    text: "Freetym delivers clear, transparent results, and is highly recommended!",
    client: "Michelin",
    position: "Marketing Manager",
  },
  {
    text: "We found perfect creators for our niche. The dashboard is so easy to use.",
    client: "Universal",
    position: "Social Media Head",
  },
  {
    text: "Clear ROI tracking and super support. Our go-to for every campaign now.",
    client: "Shiseido",
    position: "Digital Lead",
  },
  {
    text: "Loved the real-time recommendations!",
    client: "Heineken",
    position: "Brand Specialist",
  },
  {
    text: "Great onboarding and influencer collaboration.",
    client: "Guess",
    position: "Campaign Manager",
  },
  {
    text: "Effortless campaign launches and detailed reports.",
    client: "L'Oreal",
    position: "Senior Marketing Specialist",
  },
];

// Inline OTP popup component (scoped)
function OtpPopup({
  open,
  onClose,
  onVerify,
  otp,
  setOtp,
  timer,
  onResend,
  type,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Enter {type} OTP</h3>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Enter OTP"
        />
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            onClick={onVerify}
          >
            Verify
          </button>
          <button className="text-gray-500 underline" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="text-sm text-gray-700 flex items-center justify-between">
          {timer > 0 ? (
            <span>Resend in {timer}s</span>
          ) : (
            <button className="text-blue-600 underline" onClick={onResend}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Search location...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const commit = (val) => {
    onChange({ target: { name: "location", value: val } });
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      className={`relative ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div
        className={`flex items-center h-8 px-3 border rounded-[8px] text-sm bg-white ${
          disabled ? "pointer-events-none" : "cursor-text"
        }`}
        onClick={() => !disabled && setOpen(true)}
      >
        <input
          type="text"
          className="w-full outline-none bg-transparent placeholder:text-gray-400"
          placeholder={value ? value : placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
          disabled={disabled}
        />
        {value && (
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              commit("");
            }}
            aria-label="Clear"
            title="Clear"
          >
            ×
          </button>
        )}
        <span className="ml-2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-[8px] shadow-lg max-h-56 overflow-auto">
          {filtered.length ? (
            filtered.map((opt, i) => (
              <div
                key={opt}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  i === highlight ? "bg-indigo-50" : ""
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={() => commit(opt)}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
export default function AgencySignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    businessEmail: "",
    phone: "", // only 10 digits; UI shows +91
    location: "",
    termsAccepted: false,
    password: "",
    confirmPassword: "",
    emailOtp: "",
    phoneOtp: "",
  });

  const [errors, setErrors] = useState({});
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [showEmailOtpPopup, setShowEmailOtpPopup] = useState(false);
  const [showPhoneOtpPopup, setShowPhoneOtpPopup] = useState(false);
  const [emailOtpTimer, setEmailOtpTimer] = useState(0);
  const [phoneOtpTimer, setPhoneOtpTimer] = useState(0);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const router = useRouter();

  const locations = [
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Kolkata",
    "Chennai",
    "Pune",
    "Hyderabad",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Surat",
    "Patna",
    "Indore",
    "Guwahati",
    "Kochi",
    "Gurgaon",
    "Rajkot",
    "Malappuram",
    "Chandigarh",
    "Thiruvananthapuram",
    "Noida",
  ];

  // Regex
  const nameRegex = /^[A-Za-z ]{3,35}$/;
  const emailRegex = /\S+@\S+\.\S+/;

  // Password rules
  const hasMinLen = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const isPasswordValid =
    hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  // Progressive unlock
  const isNameCompanyValid = useMemo(
    () => nameRegex.test(form.fullName.trim()) && !!form.companyName.trim(),
    [form.fullName, form.companyName]
  );
  const isEmailValid = useMemo(
    () => emailRegex.test(form.businessEmail.trim()),
    [form.businessEmail]
  );
  const canPhone = emailOtpVerified;
  const isLocValid = useMemo(() => !!form.location, [form.location]);
  const isConfirmValid =
    form.confirmPassword && form.confirmPassword === form.password;

  const unlock = {
    nameCompany: true,
    email: isNameCompanyValid,
    phone: canPhone,
    loc: phoneOtpVerified,
    password: isLocValid,
    confirm: isPasswordValid,
    terms: isConfirmValid,
    submit: form.termsAccepted,
  };

  // timers
  useEffect(() => {
    let id = null;
    if (showEmailOtpPopup && emailOtpTimer > 0)
      id = setInterval(() => setEmailOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [showEmailOtpPopup, emailOtpTimer]);

  useEffect(() => {
    let id = null;
    if (showPhoneOtpPopup && phoneOtpTimer > 0)
      id = setInterval(() => setPhoneOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [showPhoneOtpPopup, phoneOtpTimer]);

  // clear “verify” errors if flag becomes true (belt & suspenders)
  useEffect(() => {
    if (emailOtpVerified) {
      setErrors((er) => {
        const { emailOtp, ...rest } = er;
        return rest;
      });
    }
  }, [emailOtpVerified]);

  useEffect(() => {
    if (phoneOtpVerified) {
      setErrors((er) => {
        const { phoneOtp, ...rest } = er;
        return rest;
      });
    }
  }, [phoneOtpVerified]);

  // handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "phone") v = String(v).replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, [name]: v }));

    setErrors((prev) => {
      const next = { ...prev };
      if (name === "fullName") {
        if (!v.trim()) next.fullName = "Full Name is required";
        else if (!nameRegex.test(v.trim()))
          next.fullName = "Name must be 3–35 letters (only alphabets & spaces)";
        else delete next.fullName;
      }

      if (name === "companyName") {
        if (!v.trim()) next.companyName = "Company Name is required";
        else delete next.companyName;
      }
      if (name === "businessEmail") {
        if (!v.trim()) next.businessEmail = "Business email is required";
        else if (!emailRegex.test(v.trim()))
          next.businessEmail = "Enter a valid email address";
        else delete next.businessEmail;
        // clear server-side taken error when editing
        delete next.businessEmailTaken;
      }
      if (name === "phone") {
        if (!v) next.phone = "Phone is required";
        else if (v.length !== 10) next.phone = "Enter 10-digit number";
        else delete next.phone;
        // clear server-side taken error when editing
        delete next.phoneTaken;
      }
      if (name === "location") {
        if (!v) next.location = "Location is required";
        else delete next.location;
      }
      if (name === "password") {
        if (!v) next.password = "Password is required";
        else delete next.password;
      }
      if (name === "confirmPassword") {
        if (!v) next.confirmPassword = "Please confirm your password";
        else if (v !== form.password)
          next.confirmPassword = "Passwords do not match";
        else delete next.confirmPassword;
      }
      return next;
    });
  };

  // API: Email OTP (role: "agency")
  const sendEmailOtp = async () => {
    if (!isEmailValid) return;
    try {
      const res = await fetch(API("/api/auth/register/email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          email: form.businessEmail,
          role: "agency",
        }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        const msg = (data?.message || "").toLowerCase();
        if (msg.includes("already registered")) {
          setErrors((e) => ({
            ...e,
            businessEmailTaken: "Email already registered",
          }));
          setEmailOtpSent(false);
          setShowEmailOtpPopup(false);
          return;
        }
        setErrors((e) => ({
          ...e,
          businessEmailTaken: data?.message || "Failed to send email OTP",
        }));
        return;
      }

      setErrors((e) => {
        const { businessEmailTaken, ...rest } = e;
        return rest;
      });
      setEmailOtpSent(true);
      setShowEmailOtpPopup(true);
      setEmailOtpTimer(60);
    } catch {
      setErrors((e) => ({
        ...e,
        businessEmailTaken: "Failed to send email OTP",
      }));
    }
  };

  const resendEmailOtp = async () => sendEmailOtp();

  // Verify Email OTP (include name + role)
  const verifyEmailOtp = async () => {
    try {
      const res = await fetch(API("/api/auth/register/email/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          role: "agency",
          otp: form.emailOtp,
          email: form.businessEmail,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");

      setEmailOtpVerified(true);
      setShowEmailOtpPopup(false);

      // clear “verify email” error
      setErrors((er) => {
        const { emailOtp, ...rest } = er;
        return rest;
      });
    } catch (e) {
      setErrors((er) => ({
        ...er,
        emailOtp: e.message || "Invalid Email OTP",
      }));
    }
  };

  // Phone OTP (always send +91 + email)
  const sendPhoneOtp = async () => {
    if (form.phone.length !== 10) return;
    try {
      const res = await fetch(API("/api/auth/register/phone"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${form.phone}`,
          email: form.businessEmail,
        }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        const msg = (data?.message || "").toLowerCase();
        if (msg.includes("already registered")) {
          setErrors((e) => ({
            ...e,
            phoneTaken: "Mobile number already registered",
          }));
          setPhoneOtpSent(false);
          setShowPhoneOtpPopup(false);
          return;
        }
        setErrors((e) => ({
          ...e,
          phoneTaken: data?.message || "Failed to send phone OTP",
        }));
        return;
      }

      setErrors((e) => {
        const { phoneTaken, ...rest } = e;
        return rest;
      });
      setPhoneOtpSent(true);
      setShowPhoneOtpPopup(true);
      setPhoneOtpTimer(60);
    } catch {
      setErrors((e) => ({ ...e, phoneTaken: "Failed to send phone OTP" }));
    }
  };
  const resendPhoneOtp = async () => sendPhoneOtp();

  const verifyPhoneOtp = async () => {
    try {
      const res = await fetch(API("/api/auth/register/phone/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.businessEmail,
          phone: `+91${form.phone}`,
          otp: form.phoneOtp,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");

      setPhoneOtpVerified(true);
      setShowPhoneOtpPopup(false);

      // clear “verify phone” error
      setErrors((er) => {
        const { phoneOtp, ...rest } = er;
        return rest;
      });
    } catch (e) {
      setErrors((er) => ({
        ...er,
        phoneOtp: e.message || "Invalid Phone OTP",
      }));
    }
  };

  // Final registration (Agency)
  const completeRegistration = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        companyName: form.companyName,
        businessEmail: form.businessEmail,
        phone: `+91${form.phone}`,
        password: form.password,
        confirmPassword: form.confirmPassword,
        location: form.location,
        termsAccepted: String(!!form.termsAccepted),
      };

      const res = await fetch(API("/api/auth/register/agency"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      router.push("/login");
    } catch (e) {
      setErrors((er) => ({
        ...er,
        submit: e.message || "Registration failed",
      }));
    }
  };

  // Validate before submit
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full Name is required";
    else if (!nameRegex.test(form.fullName.trim()))
      errs.fullName = "Name must be 3–35 letters (only alphabets & spaces)";

    if (!form.companyName) errs.companyName = "Company Name is required";

    if (!form.businessEmail) errs.businessEmail = "Business email is required";
    else if (!emailRegex.test(form.businessEmail.trim()))
      errs.businessEmail = "Enter a valid email address";

    if (!form.phone) errs.phone = "Phone is required";
    else if (form.phone.length !== 10) errs.phone = "Enter 10-digit number";

    if (!form.location) errs.location = "Location is required";

    if (!form.password) errs.password = "Password is required";
    else if (!isPasswordValid)
      errs.password = "Password doesn’t meet requirements";

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (!emailOtpVerified) errs.emailOtp = "Please verify your email OTP";
    if (!phoneOtpVerified) errs.phoneOtp = "Please verify your phone OTP";
    if (!form.termsAccepted) errs.termsAccepted = "Please accept terms";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) setErrors(v);
    else {
      setErrors({});
      await completeRegistration();
    }
  };

  const disabledStyle = (enabled) =>
    enabled ? "" : "opacity-60 cursor-not-allowed";

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-6 py-8 font-[Poppins] overflow-x-hidden">
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />

      <div className="flex flex-col lg:flex-row items-start justify-start gap-6 lg:gap-10 max-w-[1280px] mx-auto">
        {/* Left - Signup Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black rounded-[10px] p-6 w-full max-w-[520px] shadow-md"
        >
          <h2 className="text-[#2E3192] text-[18px] font-bold mb-6">
            Agency signup
          </h2>

          {/* 1) Full name + Company */}
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className={`w-full h-8 px-3 mb-2 border rounded-[8px] text-sm ${disabledStyle(
              unlock.nameCompany
            )}`}
            disabled={!unlock.nameCompany}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mb-2">{errors.fullName}</p>
          )}

          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Company / Agency Name"
            className="w-full h-8 px-3 mb-2 border rounded-[8px] text-sm"
            disabled={!form.fullName.trim()}
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mb-2">{errors.companyName}</p>
          )}

          {/* 2) Business Email + OTP */}
          <div className={`flex gap-2 mb-2 ${disabledStyle(unlock.email)}`}>
            <div className="flex w-full border rounded-[8px] overflow-hidden">
              <input
                type="email"
                name="businessEmail"
                value={form.businessEmail}
                onChange={handleChange}
                placeholder="Business email"
                className="flex-grow h-8 px-3 text-sm border-none focus:outline-none"
                disabled={!unlock.email || emailOtpVerified}
              />
              <button
                type="button"
                className="bg-gray-200 px-3 text-sm"
                onClick={() => unlock.email && isEmailValid && sendEmailOtp()}
                disabled={
                  !unlock.email ||
                  !isEmailValid ||
                  emailOtpSent ||
                  emailOtpVerified ||
                  !!errors.businessEmailTaken
                }
              >
                {emailOtpVerified
                  ? "Verified"
                  : emailOtpSent
                  ? "Sent"
                  : "Get OTP"}
              </button>
            </div>
          </div>
          {errors.businessEmail && (
            <p className="text-red-500 text-xs mb-2">{errors.businessEmail}</p>
          )}
          {errors.businessEmailTaken && (
            <p className="text-red-500 text-xs mb-2">
              {errors.businessEmailTaken}
            </p>
          )}
          {errors.emailOtp && (
            <p className="text-red-500 text-xs mb-2">{errors.emailOtp}</p>
          )}

          <OtpPopup
            open={showEmailOtpPopup}
            onClose={() => setShowEmailOtpPopup(false)}
            onVerify={verifyEmailOtp}
            otp={form.emailOtp}
            setOtp={(otp) => setForm((f) => ({ ...f, emailOtp: otp }))}
            timer={emailOtpTimer}
            onResend={resendEmailOtp}
            type="Email"
          />

          {/* 3) Phone + OTP with +91 */}
          <div className={`flex gap-2 mb-2 ${disabledStyle(unlock.phone)}`}>
            <div className="flex w-full border rounded-[8px] overflow-hidden">
              <span className="bg-gray-200 px-3 flex items-center text-sm select-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit number"
                className="flex-grow h-8 px-3 text-sm border-none focus:outline-none"
                disabled={!unlock.phone || phoneOtpVerified}
                inputMode="numeric"
                pattern="\d*"
              />
              <button
                type="button"
                className="bg-gray-200 px-3 text-sm"
                onClick={() =>
                  unlock.phone && form.phone.length === 10 && sendPhoneOtp()
                }
                disabled={
                  !unlock.phone ||
                  phoneOtpSent ||
                  phoneOtpVerified ||
                  form.phone.length !== 10 ||
                  !!errors.phoneTaken
                }
              >
                {phoneOtpVerified
                  ? "Verified"
                  : phoneOtpSent
                  ? "Sent"
                  : "Get OTP"}
              </button>
            </div>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mb-2">{errors.phone}</p>
          )}
          {errors.phoneTaken && (
            <p className="text-red-500 text-xs mb-2">{errors.phoneTaken}</p>
          )}
          {errors.phoneOtp && (
            <p className="text-red-500 text-xs mb-2">{errors.phoneOtp}</p>
          )}

          <OtpPopup
            open={showPhoneOtpPopup}
            onClose={() => setShowPhoneOtpPopup(false)}
            onVerify={verifyPhoneOtp}
            otp={form.phoneOtp}
            setOtp={(otp) => setForm((f) => ({ ...f, phoneOtp: otp }))}
            timer={phoneOtpTimer}
            onResend={resendPhoneOtp}
            type="Phone"
          />

          {/* 4) Location */}
          <div className={`mb-2 ${disabledStyle(unlock.loc)}`}>
            <SearchableSelect
              options={locations}
              value={form.location}
              onChange={handleChange}
              disabled={!unlock.indLoc}
              placeholder="Location"
            />
          </div>
          {errors.location && (
            <p className="text-red-500 text-xs mb-2">{errors.location}</p>
          )}

          {/* 5) Password */}
          <div className={`relative ${disabledStyle(unlock.password)}`}>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPwdFocused(true)}
              onBlur={() => setPwdFocused(false)}
              placeholder="Password"
              className={`w-full h-8 px-3 mb-1 border rounded-[8px] text-sm ${disabledStyle(
                unlock.password
              )}`}
              disabled={!unlock.password}
            />
            {pwdFocused && unlock.password && (
              <div className="absolute left-0 top-[38px] z-10 w-[min(520px,90vw)] bg-white rounded-[10px] border shadow-lg p-3 text-xs text-gray-800">
                <div className="font-medium mb-1">Password should include:</div>
                <ul className="space-y-1">
                  <li
                    className={`flex items-center gap-2 ${
                      hasMinLen ? "text-green-700" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        hasMinLen ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    At least 8 characters
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasUpper ? "text-green-700" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        hasUpper ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    One uppercase (A–Z)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasLower ? "text-green-700" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        hasLower ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    One lowercase (a–z)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasNumber ? "text-green-700" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        hasNumber ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    One number (0–9)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasSpecial ? "text-green-700" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        hasSpecial ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    One special (!@#$…)
                  </li>
                </ul>
              </div>
            )}
            {!pwdFocused && (
              <div
                className={`text-[11px] mb-2 ${
                  isPasswordValid ? "text-green-700" : "text-gray-600"
                }`}
              >
                Must be 8+ chars with uppercase, lowercase, number & special
                character.
              </div>
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mb-2">{errors.password}</p>
          )}

          {/* 6) Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className={`w-full h-8 px-3 mb-2 border rounded-[8px] text-sm ${disabledStyle(
              unlock.confirm
            )}`}
            disabled={!unlock.confirm}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mb-2">
              {errors.confirmPassword}
            </p>
          )}

          {/* 7) Terms */}
          <div
            className={`flex items-start gap-2 mb-4 text-sm ${disabledStyle(
              unlock.terms
            )}`}
          >
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              className="mt-1"
              disabled={!unlock.terms}
            />
            <span>
              Accept our{" "}
              <a href="#" className="text-blue-600 underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 underline">
                Privacy Policy
              </a>
            </span>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-500 text-xs mb-4">{errors.termsAccepted}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-8 bg-[#2E3192] hover:bg-[#1f2270] text-white text-sm font-medium rounded-[8px]"
            disabled={!unlock.submit}
          >
            Create Free Account
          </button>
          {errors.submit && (
            <p className="text-red-500 text-xs mt-2">{errors.submit}</p>
          )}

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a
              href="#"
              className="text-[#2E3192] underline"
              onClick={(e) => {
                e.preventDefault();
                setOpenLogin(true);
              }}
            >
              Sign In
            </a>
          </p>
        </form>

        {/* Right - Features + Testimonials */}
        <div className="flex-1 pt-[8px] lg:ml-12">
          <div className="flex flex-wrap gap-8 mb-6 lg:ml-10">
            <span className="bg-[#FEEFC3] text-sm rounded-full px-3 py-1.5">
              Rated 4.5 ⭐ on Google ↗
            </span>
            <span className="bg-[#FEEFC3] text-sm rounded-full px-3 py-1.5">
              Rated 4.5⭐ Trustpilot ↗
            </span>
          </div>

          <h2 className="text-[20px] font-semibold text-black mb-4 leading-[120%]">
            Start Your Influencer Marketing Journey with Freetym
          </h2>

          <ul className="text-sm text-black space-y-2 leading-[140%]">
            <li>🌐 Access a diverse pool of verified influencers</li>
            <li>🚀 Launch campaigns with full control & flexibility</li>
            <li>📊 Get real-time insights & campaign performance data</li>
            <li>🧩 Manage unlimited influencer partnerships</li>
            <li>🤝 Collaborate directly with creators</li>
            <li>🔍 Transparent pricing & clear ROI tracking</li>
            <li>🎯 Build campaigns that convert, not just reach</li>
          </ul>

          {/* Testimonials */}
          <div
            className="mt-6 w-full relative overflow-hidden"
            style={{ height: 225 }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
              }}
            />
            <div className="absolute inset-0">
              <div className="group h-full">
                <div className="flex h-full flex-nowrap gap-4 will-change-transform animate-marquee-slow">
                  {[...testimonials, ...testimonials].map((t, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0"
                      style={{
                        width: "250px",
                        height: "150px",
                        borderRadius: "12px",
                        border: "1px solid #FFE0BC",
                        backgroundColor: "#FFE0BC",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#333",
                          fontFamily: "Poppins, sans-serif",
                          wordWrap: "break-word",
                          flex: "1 1 auto",
                        }}
                      >
                        {t.text}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 16px",
                          backgroundColor: "#fff",
                          borderTop: "1px solid #ddd",
                          borderBottomLeftRadius: "12px",
                          borderBottomRightRadius: "12px",
                          fontSize: "13px",
                        }}
                      >
                        <span style={{ fontWeight: 500, color: "#555" }}>
                          {t.client}
                        </span>
                        <span style={{ color: "#999" }}>{t.position}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* /Testimonials */}
        </div>
      </div>

      {/* Logos Scroll Strip */}
      <div
        className="w-full mt-0 mb-[-4px] overflow-hidden px-0 py-0"
        style={{ lineHeight: 0 }}
      >
        <div className="relative flex whitespace-nowrap">
          <div className="flex animate-marquee items-center gap-12 mb-[-4px] pb-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <img
                key={`logo1-${i}`}
                src="/Brand-logos.png"
                alt="Trusted by leading Agencies"
                className="h-12 md:h-14 object-contain block m-0 p-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
