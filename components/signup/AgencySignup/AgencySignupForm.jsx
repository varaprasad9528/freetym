"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgencySignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    industryType: "",
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

  const router = useRouter();

  const industryTypes = ["Fashion", "Technology", "Fitness", "Beauty"];
  const locations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];

  // Timer logic for email OTP
  useEffect(() => {
    let interval = null;
    if (showEmailOtpPopup && emailOtpTimer > 0) {
      interval = setInterval(() => setEmailOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showEmailOtpPopup, emailOtpTimer]);

  // Timer logic for phone OTP
  useEffect(() => {
    let interval = null;
    if (showPhoneOtpPopup && phoneOtpTimer > 0) {
      interval = setInterval(() => setPhoneOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showPhoneOtpPopup, phoneOtpTimer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Send Email OTP
  const sendEmailOtp = async () => {
    try {
      const res = await fetch("/api/auth/register/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          role: "brand",
        }),
      });
      if (!res.ok) throw new Error("Failed to send email OTP");
      setEmailOtpSent(true);
      setShowEmailOtpPopup(true);
      setEmailOtpTimer(60);
      alert("Email OTP sent!");
    } catch (err) {
      alert("Error sending email OTP");
    }
  };

  // Resend Email OTP
  const resendEmailOtp = async () => {
    await sendEmailOtp();
  };

  // Send Phone OTP
  const sendPhoneOtp = async () => {
    try {
      const res = await fetch("/api/auth/register/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          email: form.email,
        }),
      });
      if (!res.ok) throw new Error("Failed to send phone OTP");
      setPhoneOtpSent(true);
      setShowPhoneOtpPopup(true);
      setPhoneOtpTimer(60);
      alert("Phone OTP sent!");
    } catch (err) {
      alert("Error sending phone OTP");
    }
  };

  // Resend Phone OTP
  const resendPhoneOtp = async () => {
    await sendPhoneOtp();
  };

  // Verify Email OTP
  const verifyEmailOtp = async () => {
    try {
      const res = await fetch("/api/auth/register/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: form.emailOtp,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setEmailOtpVerified(true);
      setShowEmailOtpPopup(false);
      alert("Email verified!");
    } catch (err) {
      alert("Invalid Email OTP");
    }
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async () => {
    try {
      const res = await fetch("/api/auth/register/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          otp: form.phoneOtp,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setPhoneOtpVerified(true);
      setShowPhoneOtpPopup(false);
      alert("Phone verified!");
    } catch (err) {
      alert("Invalid Phone OTP");
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName) errs.fullName = "Full Name is required";
    if (!form.companyName) errs.companyName = "Company Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.phone) errs.phone = "Phone is required";
    if (!form.industryType) errs.industryType = "Industry Type is required";
    if (!form.location) errs.location = "Location is required";
    if (!form.termsAccepted) errs.termsAccepted = "Please accept terms";
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!emailOtpVerified) errs.emailOtp = "Please verify your email OTP";
    if (!phoneOtpVerified) errs.phoneOtp = "Please verify your phone OTP";
    return errs;
  };

  // Final Brand Registration API
  const completeRegistration = async () => {
    try {
      const res = await fetch("/api/auth/register/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });
      if (!res.ok) throw new Error("Registration failed");
      alert("Registration successful!");
      router.push("/dashboard/brand");
    } catch (err) {
      alert("Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      await completeRegistration();
    }
  };

  // OTP Popup Component
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

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-6 py-8 font-[Poppins]">
      <div className="flex flex-col lg:flex-row items-start justify-start gap-6 lg:gap-10 max-w-[1280px] mx-auto">
        {/* Left - Signup Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black rounded-[10px] p-6 w-full max-w-[480px] shadow-md"
        >
          <h2 className="text-[#2E3192] text-[18px] font-bold mb-6">
            Agencys signup
          </h2>

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full h-8 px-3 mb-2 border rounded-[8px] text-sm"
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
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mb-2">{errors.companyName}</p>
          )}

          <div className="flex gap-2 mb-2">
            <div className="flex w-full border rounded-[8px] overflow-hidden">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Business mail"
                className="flex-grow h-8 px-3 text-sm border-none focus:outline-none"
                disabled={emailOtpVerified}
              />
              <button
                type="button"
                className="bg-gray-200 px-3 text-sm"
                onClick={sendEmailOtp}
                disabled={emailOtpSent || emailOtpVerified}
              >
                {emailOtpVerified
                  ? "Verified"
                  : emailOtpSent
                  ? "Sent"
                  : "Get OTP"}
              </button>
            </div>
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mb-2">{errors.email}</p>
          )}
          {errors.emailOtp && (
            <p className="text-red-500 text-xs mb-2">{errors.emailOtp}</p>
          )}

          <div className="flex gap-2 mb-2">
            <div className="flex w-full border rounded-[8px] overflow-hidden">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="flex-grow h-8 px-3 text-sm border-none focus:outline-none"
                disabled={phoneOtpVerified}
              />
              <button
                type="button"
                className="bg-gray-200 px-3 text-sm"
                onClick={sendPhoneOtp}
                disabled={phoneOtpSent || phoneOtpVerified}
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
          {errors.phoneOtp && (
            <p className="text-red-500 text-xs mb-2">{errors.phoneOtp}</p>
          )}

          {/* OTP Popups */}
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

          <div className="flex gap-2 mb-2">
            <select
              name="industryType"
              value={form.industryType}
              onChange={handleChange}
              className="w-1/2 h-8 px-3 border rounded-[8px] text-sm"
            >
              <option value="">Industry Type</option>
              {industryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-1/2 h-8 px-3 border rounded-[8px] text-sm"
            >
              <option value="">Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          {(errors.industryType || errors.location) && (
            <div className="mb-2">
              {errors.industryType && (
                <p className="text-red-500 text-xs">{errors.industryType}</p>
              )}
              {errors.location && (
                <p className="text-red-500 text-xs">{errors.location}</p>
              )}
            </div>
          )}

          {/* Password Fields */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full h-8 px-3 mb-2 border rounded-[8px] text-sm"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mb-2">{errors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full h-8 px-3 mb-2 border rounded-[8px] text-sm"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mb-2">
              {errors.confirmPassword}
            </p>
          )}

          <div className="flex items-start gap-2 mb-4 text-sm">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              className="mt-1"
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

          <button
            type="submit"
            className="w-full h-8 bg-[#2E3192] hover:bg-[#1f2270] text-white text-sm font-medium rounded-[8px]"
          >
            Create Free Account
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a href="#" className="text-[#2E3192] underline">
              Sign In
            </a>
          </p>
        </form>

        {/* Right - Features List */}
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
        </div>
      </div>

      {/* Logos Scroll Strip */}
      <div className="w-full mt-16 overflow-hidden px-0">
        <div className="relative flex whitespace-nowrap">
          <div className="flex animate-marquee space-x-16 items-center opacity-80 grayscale hover:grayscale-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <img
                key={`logo1-${i}`}
                src="/Brand-logos.png"
                alt="Trusted by leading Agencys"
                className="h-20 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
