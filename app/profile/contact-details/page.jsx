"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

/**
 * Adjust these 4 endpoints if your backend paths differ.
 * You already shared the email send endpoint; verify endpoints are inferred.
 */
const EMAIL_SEND_URL = `${API_BASE}/api/auth/register/email`; // POST {name,email,role}
const EMAIL_VERIFY_URL = `${API_BASE}/api/auth/register/email/verify`; // POST {name,role,otp,email}
const PHONE_SEND_URL = `${API_BASE}/api/auth/register/phone`; // POST {phone,email}
const PHONE_VERIFY_URL = `${API_BASE}/api/auth/register/phone/verify`; // POST {email,phone,otp}

const DEFAULT_NAME = "Test Influencer";
const ROLE = "influencer";

function VerifiedPill() {
  return (
    <span className="bg-[#F16623] text-white text-xs font-semibold rounded-full px-4 py-1 flex items-center gap-1 ml-2">
      Verified <CheckCircle2 size={16} className="ml-1" />
    </span>
  );
}

function VerifyPill({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="bg-[#F16623] text-white text-xs font-semibold rounded-full px-4 py-1 flex items-center gap-1 ml-2 disabled:opacity-60"
    >
      {loading ? "Sending..." : "Verify"}
    </button>
  );
}

export default function ContactDetailsPage() {
  // WhatsApp digits only; we render +91 as a fixed prefix
  const [whatsDigits, setWhatsDigits] = useState("");
  const [email, setEmail] = useState("");

  // Which field is currently verifying: 'email' | 'whatsapp' | null
  const [otpMode, setOtpMode] = useState(null);
  const [otp, setOtp] = useState("");

  const [verified, setVerified] = useState({ whatsapp: false, email: false });

  // loading + feedback
  const [sending, setSending] = useState({ email: false, whatsapp: false });
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const fullPhone = whatsDigits ? `+91${whatsDigits}` : "";

  // --- API calls ---
  const sendEmailOtp = async () => {
    try {
      setErr("");
      setMsg("");
      setSending((s) => ({ ...s, email: true }));
      const res = await fetch(EMAIL_SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: DEFAULT_NAME, email, role: ROLE }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Failed to send email OTP");
      setMsg(j?.message || "OTP sent to email.");
      setOtpMode("email");
    } catch (e) {
      setErr(e.message || "Failed to send email OTP");
    } finally {
      setSending((s) => ({ ...s, email: false }));
    }
  };

  const verifyEmailOtp = async () => {
    try {
      setErr("");
      setMsg("");
      setVerifying(true);
      const res = await fetch(EMAIL_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: DEFAULT_NAME, role: ROLE, otp, email }),
      });
      const j = await res.json();
      if (!res.ok || j?.success === false)
        throw new Error(j?.message || "Email OTP verification failed");
      setMsg(j?.message || "Email OTP verified successfully.");
      setVerified((v) => ({ ...v, email: true }));
      setOtpMode(null);
      setOtp("");
    } catch (e) {
      setErr(e.message || "Email OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const sendWhatsappOtp = async () => {
    try {
      if (!fullPhone) throw new Error("Enter WhatsApp number");
      setErr("");
      setMsg("");
      setSending((s) => ({ ...s, whatsapp: true }));
      const res = await fetch(PHONE_SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, email }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Failed to send WhatsApp OTP");
      setMsg(j?.message || "OTP sent to WhatsApp.");
      setOtpMode("whatsapp");
    } catch (e) {
      setErr(e.message || "Failed to send WhatsApp OTP");
    } finally {
      setSending((s) => ({ ...s, whatsapp: false }));
    }
  };

  const verifyWhatsappOtp = async () => {
    try {
      if (!fullPhone) throw new Error("Enter WhatsApp number");
      setErr("");
      setMsg("");
      setVerifying(true);
      const res = await fetch(PHONE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: fullPhone, otp }),
      });
      const j = await res.json();
      if (!res.ok)
        throw new Error(j?.message || "WhatsApp OTP verification failed");
      setMsg(j?.message || "WhatsApp OTP verified.");
      setVerified((v) => ({ ...v, whatsapp: true }));
      setOtpMode(null);
      setOtp("");
    } catch (e) {
      setErr(e.message || "WhatsApp OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (!otpMode || !otp) return;
    if (otpMode === "email") return verifyEmailOtp();
    if (otpMode === "whatsapp") return verifyWhatsappOtp();
  };

  // simple validation
  const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim());
  const isPhoneValid = whatsDigits.length === 10;

  return (
    <div>
      {/* Top header bar */}
      <div
        className="w-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "50px",
          marginBottom: "24px",
        }}
      />
      <div className="px-10 py-2">
        <h2 className="text-lg font-bold mb-10">Contact Details</h2>

        {(msg || err) && (
          <div
            className={`mb-4 text-sm px-3 py-2 rounded border ${
              err
                ? "text-red-700 bg-red-50 border-red-200"
                : "text-green-700 bg-green-50 border-green-200"
            }`}
          >
            {err || msg}
          </div>
        )}

        <form
          className="max-w-3xl mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* WhatsApp Number (+91 prefix) */}
          <div className="mb-5">
            <label
              className="block mb-1 text-sm font-semibold"
              htmlFor="whatsapp"
            >
              WhatsApp Number
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-100 text-sm text-gray-700 select-none">
                +91
              </span>
              <input
                id="whatsapp"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={whatsDigits}
                disabled={verified.whatsapp}
                onChange={(e) =>
                  setWhatsDigits(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 10-digit number"
                className="w-full px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm"
              />
              {verified.whatsapp ? (
                <VerifiedPill />
              ) : (
                <VerifyPill
                  onClick={sendWhatsappOtp}
                  loading={sending.whatsapp}
                />
              )}
            </div>
            {!verified.whatsapp && whatsDigits && !isPhoneValid && (
              <p className="text-xs text-red-600 mt-1">
                Enter a valid 10-digit number.
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-8">
            <label className="block mb-1 text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <div className="flex items-center">
              <input
                id="email"
                type="email"
                value={email}
                disabled={verified.email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              />
              {verified.email ? (
                <VerifiedPill />
              ) : (
                <VerifyPill onClick={sendEmailOtp} loading={sending.email} />
              )}
            </div>
            {!verified.email && email && !isEmailValid && (
              <p className="text-xs text-red-600 mt-1">Enter a valid email.</p>
            )}
          </div>

          {/* OTP Area */}
          {otpMode && (
            <div className="mb-6 flex items-center gap-3">
              <label className="text-sm font-semibold">
                Enter OTP sent to{" "}
                {otpMode === "whatsapp" ? "WhatsApp" : "Email"}:
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="px-3 py-2 border rounded bg-white text-sm"
                placeholder="Enter OTP"
              />
              <button
                type="button"
                onClick={handleOtpVerify}
                disabled={verifying || !otp}
                className="bg-[#F16623] text-white px-4 py-2 rounded-md font-semibold text-xs disabled:opacity-60"
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                className="ml-2 text-xs text-gray-500"
                onClick={() => {
                  setOtp("");
                  setOtpMode(null);
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Submit Button (no-op demo) */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="bg-[#FEBB97] text-white px-10 py-2 rounded-md font-semibold text-base transition"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
