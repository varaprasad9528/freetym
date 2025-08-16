"use client";
import { useEffect, useRef, useState } from "react";

export default function RequestDemoModal({ open, onClose }) {
  const overlayRef = useRef();
  const autoCloseRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  // OTP
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpServerMsg, setOtpServerMsg] = useState("");

  // ---- API base ----
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  const PUBLIC_BASE = API_BASE ? `${API_BASE}/api/public` : "/api/public";
  const DEMO_ENDPOINT = `${PUBLIC_BASE}/demo-requests`;
  // ---- Phone OTP endpoints ----
  const PHONE_SEND_URL = `${API_BASE}/api/auth/register/phone`; // POST { phone, email }
  const PHONE_VERIFY_URL = `${API_BASE}/api/auth/register/phone/verify`; // POST { email, phone, otp }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const handleClose = () => {
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    onClose?.();
  };

  // Auto-hide success
  useEffect(() => {
    if (!success) return;
    autoCloseRef.current = setTimeout(() => handleClose(), 5000);
    return () => autoCloseRef.current && clearTimeout(autoCloseRef.current);
  }, [success]);

  if (!open) return null;

  // ——— Helpers ———
  const countWords = (s) => s.trim().split(/\s+/).filter(Boolean).length;

  const isValidEmail = (email) => {
    const str = email.trim();
    if (!str || str.includes("..")) return false;
    const [local, domain] = str.split("@");
    if (!local || !domain) return false;
    if (!/^[A-Za-z0-9._%+-]+$/.test(local)) return false;
    if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$/.test(domain)) return false;
    return true;
  };

  const validate = () => {
    const errs = {};
    const nameTrim = form.name.trim().replace(/\s+/g, " ");
    const nameWords = nameTrim ? nameTrim.split(" ").length : 0;

    if (!nameTrim) {
      errs.name = "Full Name is required.";
    } else if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(nameTrim)) {
      errs.name = "Name must contain letters only.";
    } else if (nameWords < 3 || nameWords > 35) {
      errs.name = "Name must be 3 to 35 words.";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      errs.email = "Enter a valid email (e.g., name@company.com).";
    }

    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(form.phone)) {
      errs.phone = "Enter a valid 10-digit number.";
    } else if (!phoneVerified) {
      errs.phone = "Please verify your number via OTP.";
    }

    if (!form.role) errs.role = "Role is required.";

    if (countWords(form.message) > 150) {
      errs.message = "Message must be 150 words maximum.";
    }

    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((p) => ({ ...p, [e.target.name]: undefined }));
    setServerError("");
  };

  // digits only; last 10
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(-10);
    setForm({ ...form, phone: digits });
    setErrors((p) => ({ ...p, phone: undefined }));
    setServerError("");
    setPhoneVerified(false); // reset if user edits number
  };

  // ——— OTP flow (phone only) ———
  const openOtp = async () => {
    if (!/^\d{10}$/.test(form.phone)) {
      setErrors((p) => ({ ...p, phone: "Enter a valid 10-digit number." }));
      return;
    }
    if (!isValidEmail(form.email)) {
      setErrors((p) => ({
        ...p,
        email: "Valid email required before sending OTP.",
      }));
      return;
    }

    setOtp("");
    setOtpServerMsg("");
    setOtpOpen(true);
    setOtpSending(true);

    try {
      const res = await fetch(PHONE_SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${form.phone}`,
          email: form.email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.error || "Failed to send OTP");
      }
      setOtpServerMsg("OTP sent to your mobile.");
    } catch (e) {
      setOtpServerMsg(e.message || "Failed to send OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{4,8}$/.test(otp)) {
      setOtpServerMsg("Enter the OTP you received.");
      return;
    }
    setOtpVerifying(true);
    setOtpServerMsg("");
    try {
      const res = await fetch(PHONE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          phone: `+91${form.phone}`,
          otp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.error || "Invalid OTP");
      }
      setPhoneVerified(true);
      setOtpOpen(false);
    } catch (e) {
      setOtpServerMsg(e.message || "OTP verification failed.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setServerError("");
    setSuccess(false);

    try {
      const payload = {
        name: form.name.trim().replace(/\s+/g, " "),
        email: form.email.trim(),
        phone: `+91${form.phone}`,
        company: form.company.trim(),
        role: form.role,
        message: form.message.trim(),
      };

      const res = await fetch(DEMO_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        const msg =
          data?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        company: "",
        message: "",
      });
      setPhoneVerified(false);
      setSuccess(true);
    } catch (err) {
      setServerError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const messageWords = countWords(form.message);
  const overLimit = messageWords > 150;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-[450px] max-w-[95vw] border border-gray-200">
        {/* Close */}
        <button
          className="absolute top-6 right-6 text-xl text-gray-400 hover:text-black"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        {!success ? (
          <>
            <h2
              className="text-2xl font-bold text-center mb-2 text-[#353376]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Request Demo
            </h2>
            <p
              className="text-center text-gray-700 mb-6 text-[15px]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Discover how Freetym fits your workflow
              <br />
              Request a personalized demo.
            </p>

            {serverError ? (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {serverError}
              </div>
            ) : null}

            <form
              className="space-y-3"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone + OTP */}
              <div>
                <div className="flex gap-2">
                  <div className="flex flex-1">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-50 text-sm text-gray-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit number *"
                      className={`w-full px-3 py-2 border rounded-r focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      value={form.phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={openOtp}
                    disabled={
                      !/^\d{10}$/.test(form.phone) ||
                      phoneVerified ||
                      otpSending
                    }
                    className={`px-3 rounded bg-[#353376] text-white text-sm font-medium ${
                      phoneVerified ? "opacity-60" : "hover:bg-[#23215b]"
                    }`}
                  >
                    {phoneVerified
                      ? "Verified"
                      : otpSending
                      ? "Sending..."
                      : "Get OTP"}
                  </button>
                </div>
                {errors.phone && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <select
                  name="role"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm ${
                    errors.role ? "border-red-500" : ""
                  }`}
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="">Role *</option>
                  <option value="brand">Brand</option>
                  <option value="influencer">Influencer</option>
                  <option value="other">Other</option>
                </select>
                {errors.role && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {errors.role}
                  </div>
                )}
              </div>

              {/* Company */}
              <div>
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm"
                  value={form.company}
                  onChange={handleChange}
                />
              </div>

              {/* Message (<=150 words) */}
              <div>
                <textarea
                  name="message"
                  placeholder="Message (max 150 words)"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm resize-none ${
                    overLimit ? "border-red-500" : ""
                  }`}
                  value={form.message}
                  onChange={(e) => {
                    // hard stop at 150 words
                    const words = e.target.value.split(/\s+/).filter(Boolean);
                    if (words.length <= 150) {
                      handleChange(e);
                    } else {
                      // keep first 150 words
                      const clipped = words.slice(0, 150).join(" ");
                      setForm((p) => ({ ...p, message: clipped }));
                    }
                    setErrors((p) => ({ ...p, message: undefined }));
                  }}
                />
                <div
                  className={`text-xs mt-0.5 ${
                    overLimit ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {messageWords}/150 words
                </div>
                {errors.message && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {errors.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#353376] hover:bg-[#23215b] text-white font-medium rounded py-2 mt-2 transition disabled:opacity-70"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Request submitted!
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              We will contact you soon!
            </p>
            <button
              onClick={handleClose}
              className="mt-5 px-4 py-2 rounded-md bg-[#353376] text-white text-sm font-semibold"
              type="button"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {otpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-[380px] max-w-[95vw] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold">Verify Mobile</h4>
              <button
                className="text-xl text-gray-500"
                onClick={() => setOtpOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter the OTP sent to{" "}
              <span className="font-medium">+91 {form.phone}</span>.
            </p>

            <input
              autoFocus
              inputMode="numeric"
              maxLength={8}
              className="w-full px-3 py-2 border rounded text-center tracking-widest"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            {otpServerMsg && (
              <div className="text-xs mt-2 text-gray-600">{otpServerMsg}</div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 rounded bg-[#353376] text-white text-sm font-medium disabled:opacity-70"
                onClick={verifyOtp}
                disabled={otpVerifying}
              >
                {otpVerifying ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={openOtp}
                disabled={otpSending}
              >
                {otpSending ? "Sending..." : "Resend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
