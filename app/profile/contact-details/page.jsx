"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

/* ====== Config (uses env) ====== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE.replace(/\/+$/, ""); // strip trailing slashes

const ENDPOINTS = {
  EMAIL_SEND: `${API_BASE}/api/profile/register/email`, // POST {email}
  EMAIL_VERIFY: `${API_BASE}/api/profile/verify/email`, // PUT {email, otp}
  PHONE_SEND: `${API_BASE}/api/profile/register/phone`, // POST {phone}
  PHONE_VERIFY: `${API_BASE}/api/profile/verify/phone`, // PUT {phone, otp}
};

function VerifiedPill() {
  return (
    <span className="bg-[#F16623] text-white text-xs font-semibold rounded-full px-4 py-1 flex items-center gap-1 ml-2">
      Verified <CheckCircle2 size={16} className="ml-1" />
    </span>
  );
}

function VerifyPill({ onClick, loading, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="bg-[#F16623] text-white text-xs font-semibold rounded-full px-4 py-1 flex items-center gap-1 ml-2 disabled:opacity-60"
    >
      {loading ? "Sending..." : "Verify"}
    </button>
  );
}

export default function ContactDetailsPage() {
  const [whatsDigits, setWhatsDigits] = useState("");
  const [email, setEmail] = useState("");

  const [otpMode, setOtpMode] = useState(null); // 'email' | 'whatsapp'
  const [otp, setOtp] = useState("");

  const [verified, setVerified] = useState({ whatsapp: false, email: false });

  const [sending, setSending] = useState({ email: false, whatsapp: false });
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const fullPhone = whatsDigits ? `+91${whatsDigits}` : "";

  // simple validation
  const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim());
  const isPhoneValid = whatsDigits.length === 10;

  // ✅ Helper to get headers with token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // --- API calls ---
  const sendEmailOtp = async () => {
    try {
      if (!isEmailValid) throw new Error("Enter a valid email");
      setErr("");
      setMsg("");
      setSending((s) => ({ ...s, email: true }));
      const res = await fetch(ENDPOINTS.EMAIL_SEND, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
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
      if (!otp) throw new Error("Enter the OTP");
      if (!isEmailValid) throw new Error("Enter a valid email");
      setErr("");
      setMsg("");
      setVerifying(true);
      const res = await fetch(ENDPOINTS.EMAIL_VERIFY, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, otp }),
      });
      const j = await res.json();
      if (!res.ok)
        throw new Error(j?.message || "Email OTP verification failed");
      setMsg(j?.message || "Email address verified and updated successfully.");
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
      if (!isPhoneValid) throw new Error("Enter a valid 10-digit number");
      setErr("");
      setMsg("");
      setSending((s) => ({ ...s, whatsapp: true }));
      const res = await fetch(ENDPOINTS.PHONE_SEND, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ phone: fullPhone }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Failed to send WhatsApp OTP");
      setMsg(j?.message || "OTP sent to phone number.");
      setOtpMode("whatsapp");
    } catch (e) {
      setErr(e.message || "Failed to send WhatsApp OTP");
    } finally {
      setSending((s) => ({ ...s, whatsapp: false }));
    }
  };

  const verifyWhatsappOtp = async () => {
    try {
      if (!isPhoneValid) throw new Error("Enter a valid 10-digit number");
      if (!otp) throw new Error("Enter the OTP");
      setErr("");
      setMsg("");
      setVerifying(true);
      const res = await fetch(ENDPOINTS.PHONE_VERIFY, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ phone: fullPhone, otp }),
      });
      const j = await res.json();
      if (!res.ok)
        throw new Error(j?.message || "WhatsApp OTP verification failed");
      setMsg(j?.message || "Phone number verified and updated successfully.");
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
    if (otpMode === "email") return verifyEmailOtp();
    if (otpMode === "whatsapp") return verifyWhatsappOtp();
  };

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
                  disabled={!isPhoneValid}
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
                <VerifyPill
                  onClick={sendEmailOtp}
                  loading={sending.email}
                  disabled={!isEmailValid}
                />
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

          {/* Submit Button */}
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
