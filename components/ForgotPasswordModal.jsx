"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
const API = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

export default function ForgotPasswordModal({ open, onClose }) {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // step state
  const [otpSent, setOtpSent] = useState(false);

  // timers/loading/messages
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(""); // success/info messages
  const [openLogin, setOpenLogin] = useState(false);
  // validation
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email.trim());

  const hasMinLen = newPwd.length >= 8;
  const hasUpper = /[A-Z]/.test(newPwd);
  const hasLower = /[a-z]/.test(newPwd);
  const hasNumber = /[0-9]/.test(newPwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPwd);
  const isPwdValid =
    hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const canSendOtp = isEmailValid && !loading && timer === 0 && !otpSent;
  const canReset =
    otpSent &&
    otp.trim().length >= 4 &&
    isPwdValid &&
    confirmPwd === newPwd &&
    !loading;

  // resend countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // reset local state when modal closes/opens
  useEffect(() => {
    if (!open) {
      setEmail("");
      setOtp("");
      setNewPwd("");
      setConfirmPwd("");
      setOtpSent(false);
      setTimer(0);
      setLoading(false);
      setErr("");
      setInfo("");
    }
  }, [open]);

  if (!open) return null;

  // ---- API: Send OTP ----
  const sendEmailOtp = async () => {
    setErr("");
    setInfo("");
    if (!isEmailValid) return;

    try {
      setLoading(true);
      // const res = await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
       const res = await fetch(API("/api/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Backend examples: { "message": "User not found." }
        setErr(data?.message || "Could not send OTP. Try again.");
        return;
        // no state updates on error
      }

      // Success: { "message": "Password reset OTP sent to your email." }
      setInfo(data?.message || "OTP sent to your email.");
      setOtpSent(true);
      setTimer(60); // 60s cooldown for resend
    } catch (e) {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- API: Resend OTP (same endpoint) ----
  const resendEmailOtp = async () => {
    if (timer > 0) return;
    setErr("");
    setInfo("");
    try {
      setLoading(true);
      const res = await fetch(API("/api/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || "Resend failed. Try again.");
        return;
      }
      setInfo(data?.message || "OTP resent to your email.");
      setTimer(60);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- API: Reset Password (verifies OTP server-side) ----
  const resetPassword = async () => {
    setErr("");
    setInfo("");
    if (!canReset) return;

    try {
      setLoading(true);
      const res = await fetch(API("/api/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email,
          otp,
          newPassword: newPwd,
          confirmPassword: confirmPwd, }),
    });
      // const res = await fetch("/api/auth/reset-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email,
      //     otp,
      //     newPassword: newPwd,
      //     confirmPassword: confirmPwd,
      //   }),
      // });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Backend messages we must surface exactly:
        // "Invalid or expired OTP." | "Passwords do not match."
        setErr(data?.message || "Password reset failed. Please try again.");
        return;
      }

      // Success: "Password has been reset. Please login with your new password."
      setInfo(data?.message || "Password reset successful.");
      setTimeout(() => {
        onClose?.();
        setOpenLogin(true)
        // router.push("/login"); // adjust if your login route differs
      }, 900);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[60]">
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      <div className="bg-[#FFF9F4] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.25)] border border-gray-200 p-8 min-w-[360px] max-w-[95vw] relative">
        {/* Close */}
        <button
          className="absolute right-5 top-5 text-2xl text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "#2E3192", fontFamily: "Poppins, sans-serif" }}
        >
          Forgot Password
        </h2>

        {/* Step 1: Email */}
        <div className="mb-4">
          <label className="block font-medium mb-1" htmlFor="fp-email">
            Registered Email
          </label>
          <input
            id="fp-email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2E3192]"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent} // lock after sending OTP
            autoComplete="email"
          />
          {!isEmailValid && email.length > 0 && !otpSent && (
            <div className="text-red-500 text-xs mt-1">
              Please enter a valid email address
            </div>
          )}
        </div>

        {/* Step 1 Action */}
        {!otpSent && (
          <button
            className={`w-full py-2 rounded-md font-semibold text-lg transition mb-4 ${
              canSendOtp
                ? "bg-[#2E3192] text-white hover:bg-[#191A6C]"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            onClick={sendEmailOtp}
            disabled={!canSendOtp}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        )}

        {/* Step 2: OTP + New Password */}
        {otpSent && (
          <>
            <div className="mb-3">
              <label className="block font-medium mb-1" htmlFor="fp-otp">
                Enter OTP (sent to your email)
              </label>
              <input
                id="fp-otp"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2E3192]"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
                inputMode="numeric"
                maxLength={6}
              />
              <div className="flex items-center justify-between mt-2 text-sm">
                {timer > 0 ? (
                  <span className="text-gray-600">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendEmailOtp}
                    className="text-[#2E3192] underline"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="block font-medium mb-1" htmlFor="fp-new">
                New Password
              </label>
              <input
                id="fp-new"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2E3192]"
                type="password"
                placeholder="Enter new password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                autoComplete="new-password"
              />
              {/* One-line helper */}
              <div
                className={`text-[11px] mt-1 ${
                  isPwdValid ? "text-green-700" : "text-gray-600"
                }`}
              >
                Must be 8+ chars with uppercase, lowercase, number & special
                character.
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="fp-confirm">
                Confirm Password
              </label>
              <input
                id="fp-confirm"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2E3192]"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
              />
              {confirmPwd.length > 0 && confirmPwd !== newPwd && (
                <div className="text-red-500 text-xs mt-1">
                  Passwords do not match.
                </div>
              )}
            </div>

            <button
              className={`w-full py-2 rounded-md font-semibold text-lg transition ${
                canReset
                  ? "bg-[#2E3192] text-white hover:bg-[#191A6C]"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              onClick={resetPassword}
              disabled={!canReset}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* Messages */}
        {info && (
          <div className="text-green-600 flex items-center gap-2 mt-4 text-sm">
            <span className="text-lg">✓</span>
            {info}
          </div>
        )}
        {err && (
          <div className="text-red-600 flex items-center gap-2 mt-4 text-sm">
            <span className="text-lg">⚠️</span>
            {err}
          </div>
        )}

        {/* Back to login */}
        <div className="text-center mt-5 text-xs text-gray-500">
          Remember your password?{" "}
          <a
            href="#"
            className="text-[#2E3192] underline ml-1"
            onClick={(e) => {
              e.preventDefault();
              onClose?.();
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
