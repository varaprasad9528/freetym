"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function LoginModal({ open, onClose }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);

  const isEmailValid = (v) =>
    /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/.test(v);
  const isPwdValid = (v) => v.length >= 6;
  const canSubmit = isEmailValid(email) && isPwdValid(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setSubmitError("");
    if (!canSubmit) return;

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Try to parse JSON either way (ok or error)
      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        data = {};
      }

      // If backend sends 401/400 with { message: "Invalid credentials." }
      if (!res.ok) {
        setSubmitError(
          typeof data?.message === "string" && data.message.trim()
            ? data.message
            : "Login failed. Try again."
        );
        return;
      }

      // Success case must include token, role, userId
      const { token, role, userId, message } = data || {};

      // Edge case: API returns 200 but indicates failure via message
      if (!token || !role || !userId) {
        setSubmitError(
          typeof message === "string" && message.trim()
            ? message
            : "Unexpected response. Please try again."
        );
        return;
      }

      // Persist auth (adjust if you use cookies)
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);

      // Route by role (tweak to your paths)
      if (role === "influencer") {
        router.push("/signup/influencer/dashboard");
      } else if (role === "brand" || role === "agency") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }

      onClose?.();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <ForgotPasswordModal
        open={openForgot}
        onClose={() => setOpenForgot(false)}
      />

      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="bg-[#FFF9F4] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.25)] border border-gray-200 p-8 min-w-[350px] max-w-[95vw] relative">
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
            Login to Freetym
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2E3192]"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                autoComplete="email"
              />
              {touched.email && !isEmailValid(email) && (
                <div className="text-red-500 text-xs mt-1">
                  Please enter a valid email address
                </div>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block font-medium mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2E3192] pr-10"
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-lg text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
              {touched.password && !isPwdValid(password) && (
                <div className="text-red-500 text-xs mt-1">
                  Password should be atleast 6 characters
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-5 mt-1">
              <span />
              <a
                href="#"
                className="text-xs text-gray-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenForgot(true);
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Server error (shows "Invalid credentials." verbatim) */}
            {submitError && (
              <div className="text-red-600 flex items-center gap-2 mb-3 text-sm">
                <span className="text-lg">⚠️</span>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              className={`w-full py-2 rounded-md font-semibold text-lg transition 
                ${
                  canSubmit && !loading
                    ? "bg-[#2E3192] text-white hover:bg-[#191A6C]"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              disabled={!canSubmit || loading}
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-5 text-xs text-gray-500">
            Do not have an account?
            <a
              href="#"
              className="text-[#2E3192] underline ml-1"
              onClick={(e) => {
                e.preventDefault();
                onClose?.();
                router.push("/signup");
              }}
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
