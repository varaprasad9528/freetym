"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function InfluencerSignupForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    location: "",
    language: "",
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

  const genders = ["Male", "Female", "Other"];
  const locations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];
  const languages = ["English", "Hindi", "Telugu", "Tamil"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  // 1. Send Email OTP
  const sendEmailOtp = async () => {
    try {
      const res = await fetch("/api/auth/register/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          role: "influencer",
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

  // 2. Resend Email OTP
  const resendEmailOtp = async () => {
    await sendEmailOtp();
  };

  // 3. Send Phone OTP
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

  // 4. Resend Phone OTP
  const resendPhoneOtp = async () => {
    await sendPhoneOtp();
  };

  // 5. Verify Email OTP
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

  // 6. Verify Phone OTP
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

  // Registration validation and submit
  const validate = () => {
    let errs = {};
    if (!form.fullName) errs.fullName = "Full Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.phone) errs.phone = "Phone Number is required";
    if (!form.gender) errs.gender = "Gender is required";
    if (!form.dob) errs.dob = "Date of Birth is required";
    if (!form.location) errs.location = "Location is required";
    if (!form.language) errs.language = "Language is required";
    if (!form.termsAccepted) errs.termsAccepted = "You must accept the terms";
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
    // OTP verification checks
    if (!emailOtpVerified) errs.emailOtp = "Please verify your email OTP";
    if (!phoneOtpVerified) errs.phoneOtp = "Please verify your phone OTP";
    return errs;
  };

  // 7. Complete Registration (Influencer)
  const completeRegistration = async () => {
    try {
      const res = await fetch("/api/auth/register/influencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });
      if (!res.ok) throw new Error("Registration failed");
      alert("Registration successful!");
      router.push("/dashboard/influencer");
    } catch (err) {
      alert("Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
    } else {
      setErrors({});
      await completeRegistration();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-16 px-6 py-12 font-[Poppins] bg-[#FFF8F0]">
      {/* Sign-up Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-black rounded-[20px] p-6 w-[662px] shadow-md"
      >
        <h2 className="text-[#2E3192] text-[24px] font-semibold mb-6 text-left">
          Influencer sign up
        </h2>

        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full h-9 px-3 mb-4 border rounded-[10px] text-sm"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mb-2">{errors.fullName}</p>
        )}

        {/* Email with OTP */}
        <div className="flex gap-2 mb-4">
          <div className="flex w-full border rounded-[10px] overflow-hidden">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
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
          <p className="text-red-500 text-sm mb-2">{errors.email}</p>
        )}
        {errors.emailOtp && (
          <p className="text-red-500 text-sm mb-2">{errors.emailOtp}</p>
        )}

        {/* Phone with OTP */}
        <div className="flex gap-2 mb-4">
          <div className="flex w-full border rounded-[10px] overflow-hidden">
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
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
          <p className="text-red-500 text-sm mb-2">{errors.phone}</p>
        )}
        {errors.phoneOtp && (
          <p className="text-red-500 text-sm mb-2">{errors.phoneOtp}</p>
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

        <div className="flex gap-4 mb-4">
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
          >
            <option value="">Gender</option>
            {genders.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
          />
        </div>

        <div className="flex gap-4 mb-4">
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
          >
            <option value="">Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
          >
            <option value="">Language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Password Fields */}
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full h-9 px-3 mb-4 border rounded-[10px] text-sm"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password}</p>
        )}

        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full h-9 px-3 mb-4 border rounded-[10px] text-sm"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-2">{errors.confirmPassword}</p>
        )}

        <div className="flex justify-center items-center gap-2 mb-6">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={form.termsAccepted}
            onChange={handleChange}
          />
          <span className="text-sm">
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
          <p className="text-red-500 text-sm mb-4 text-center">
            {errors.termsAccepted}
          </p>
        )}

        <button
          type="submit"
          className="w-full h-10 bg-[#2E3192] hover:bg-[#1f2270] text-white text-sm font-medium rounded-[8px]"
        >
          Create Free Account
        </button>

        <p className="text-center text-sm mt-4">
          Already have an Account?{" "}
          <a href="#" className="text-[#2E3192] underline">
            Sign In
          </a>
        </p>
      </form>

      {/* Right Text Section */}
      <div className="max-w-[644px] mt-2">
        <h1 className="text-[33px] font-medium text-black leading-[100%] mb-6 text-center">
          Make Social Media Growth <br /> Fun, Motivating & Rewarding
        </h1>
        <p className="text-[20px] font-normal leading-[140%] text-black text-left max-w-[844px]">
          At Freetym, we help you turn your free time into pay time. Whether
          you're an aspiring creator or a seasoned influencer, our platform
          connects you with top brands, boosts your growth on Instagram and
          YouTube, and helps you earn doing what you love. Start your journey
          with Freetym — where content becomes a career.
        </p>
        <ul className="mt-6 space-y-2 text-[18px] text-black font-normal text-left">
          <li>🏆 Showcase your profile & achievements</li>
          <li>📣 Get more brand collaborations & visibility</li>
          <li>📈 Analyze & monitor your social media stats</li>
          <li>📝 Apply Unlimited campaigns</li>
          <li>🤝 Work with multiple brands.</li>
          <li>💰 Earn what you deserve.</li>
          <li>✅ 100% transparent.</li>
        </ul>
      </div>
    </div>
  );
}
