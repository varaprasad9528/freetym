// app/(wherever)/InfluencerSignupForm.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

// --- Change this if your backend origin differs ---
const BASE = "http://localhost:5000";

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
    phone: "", // store ONLY 10 digits here
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

  const [pwdFocused, setPwdFocused] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const router = useRouter();

  const genders = ["Male", "Female", "Other"];
  const locations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];
  const languages = ["English", "Hindi", "Telugu", "Tamil"];

  // TODAY for DOB max
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Regex / checks
  const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  const emailRegex = /\S+@\S+\.\S+/;

  const hasMinLen = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const isPasswordValid =
    hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  // validators for unlocking
  const isNameValid = useMemo(
    () => nameRegex.test(form.fullName.trim()),
    [form.fullName]
  );
  const isEmailValid = useMemo(
    () => emailRegex.test(form.email.trim()),
    [form.email]
  );
  const isGenderDobValid = useMemo(
    () => !!form.gender && !!form.dob && form.dob <= today,
    [form.gender, form.dob, today]
  );
  const isLocLangValid = useMemo(
    () => !!form.location && !!form.language,
    [form.location, form.language]
  );
  const isConfirmValid =
    form.confirmPassword && form.confirmPassword === form.password;

  // unlock logic
  const unlock = {
    name: true,
    email: isNameValid,
    phone: emailOtpVerified,
    genderDob: phoneOtpVerified,
    locLang: isGenderDobValid,
    password: isLocLangValid,
    confirm: isPasswordValid,
    terms: isConfirmValid,
    submit: form.termsAccepted,
  };

  // change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;

    if (name === "phone") {
      v = String(v).replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: v }));

    setErrors((prev) => {
      const next = { ...prev };

      if (name === "fullName") {
        if (!v.trim()) next.fullName = "Full Name is required";
        else if (!nameRegex.test(v.trim()))
          next.fullName = "Only letters and spaces allowed (no numbers)";
        else delete next.fullName;
      }

      if (name === "email") {
        if (!v.trim()) next.email = "Email is required";
        else if (!emailRegex.test(v.trim()))
          next.email = "Enter a valid email address";
        else delete next.email;
      }

      if (name === "dob") {
        if (!v) next.dob = "Date of Birth is required";
        else if (v > today) next.dob = "DOB cannot be in the future";
        else delete next.dob;
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

      if (name === "phone") {
        if (!v) next.phone = "Phone Number is required";
        else if (v.length !== 10) next.phone = "Enter 10-digit number";
        else delete next.phone;
      }

      return next;
    });
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

  // API calls wired to your backend contracts

  // 1) Register Email (get OTP)
  // POST http://localhost:5000/api/auth/register/email
  // body: { name, email, role: "influencer" }
  const sendEmailOtp = async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/register/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName, // maps to "name"
          email: form.email,
          role: "influencer",
        }),
      });
      if (!res.ok) throw new Error("Failed to send email OTP");
      setEmailOtpSent(true);
      setShowEmailOtpPopup(true);
      setEmailOtpTimer(60);
      alert("Email OTP sent!");
    } catch (e) {
      alert(e.message || "Error sending email OTP");
    }
  };

  const resendEmailOtp = async () => {
    await sendEmailOtp();
  };

  // 2) Verify Email OTP
  // body: { name, role, otp, email }
  const verifyEmailOtp = async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/register/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          role: "influencer",
          otp: form.emailOtp,
          email: form.email,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      const data = await res.json().catch(() => ({}));
      if (data && data.success === false)
        throw new Error(data.message || "Invalid OTP");
      setEmailOtpVerified(true);
      setShowEmailOtpPopup(false);
      alert("Email verified!");
    } catch (e) {
      alert(e.message || "Invalid Email OTP");
    }
  };

  // 3) Register Phone (get OTP)
  // POST .../api/auth/register/phone
  // body: { phone: "+91xxxxxxxxxx", email }
  const sendPhoneOtp = async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/register/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${form.phone}`, email: form.email }),
      });
      if (!res.ok) throw new Error("Failed to send phone OTP");
      setPhoneOtpSent(true);
      setShowPhoneOtpPopup(true);
      setPhoneOtpTimer(60);
      alert("Phone OTP sent!");
    } catch (e) {
      alert(e.message || "Error sending phone OTP");
    }
  };

  const resendPhoneOtp = async () => {
    await sendPhoneOtp();
  };

  // 4) Verify Phone OTP
  // body: { email, phone: "+91xxxxxxxxxx", otp }
  const verifyPhoneOtp = async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/register/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: `+91${form.phone}`,
          otp: form.phoneOtp,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setPhoneOtpVerified(true);
      setShowPhoneOtpPopup(false);
      alert("Phone verified!");
    } catch (e) {
      alert(e.message || "Invalid Phone OTP");
    }
  };

  // Final submit validation
  const validate = () => {
    const errs = {};
    if (!form.fullName) errs.fullName = "Full Name is required";
    else if (!nameRegex.test(form.fullName.trim()))
      errs.fullName = "Only letters and spaces allowed (no numbers)";

    if (!form.email) errs.email = "Email is required";
    else if (!emailRegex.test(form.email.trim()))
      errs.email = "Enter a valid email address";

    if (!form.phone) errs.phone = "Phone Number is required";
    else if (form.phone.length !== 10) errs.phone = "Enter 10-digit number";

    if (!form.gender) errs.gender = "Gender is required";
    if (!form.dob) errs.dob = "Date of Birth is required";
    else if (form.dob > today) errs.dob = "DOB cannot be in the future";

    if (!form.location) errs.location = "Location is required";
    if (!form.language) errs.language = "Language is required";

    if (!form.password) errs.password = "Password is required";
    else if (!isPasswordValid)
      errs.password = "Password doesn’t meet requirements";

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match";

    if (!emailOtpVerified) errs.emailOtp = "Please verify your email OTP";
    if (!phoneOtpVerified) errs.phoneOtp = "Please verify your phone OTP";
    if (!form.termsAccepted) errs.termsAccepted = "You must accept the terms";
    return errs;
  };

  // 5) Influencer Registration
  // POST .../api/auth/register/influencer
  // body: { fullName, phone:"+91...", email, password, confirmPassword, gender, dob, location, language, termsAccepted:"true" }
  const completeRegistration = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        phone: `+91${form.phone}`,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        gender: form.gender,
        dob: form.dob, // YYYY-MM-DD
        location: form.location,
        language: form.language,
        termsAccepted: String(!!form.termsAccepted), // "true" / "false"
      };

      const res = await fetch(`${BASE}/api/auth/register/influencer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      alert("Registration successful. Please login.");
      router.push("/login");
    } catch (e) {
      alert(e.message || "Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) setErrors(errs);
    else {
      setErrors({});
      await completeRegistration();
    }
  };

  const disabledStyle = (enabled) =>
    enabled ? "" : "opacity-60 cursor-not-allowed";

  return (
    <>
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />

      <div className="flex flex-col lg:flex-row items-start justify-center gap-16 px-6 py-12 font-[Poppins] bg-[#FFF8F0]">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black rounded-[20px] p-6 w-[662px] shadow-md"
        >
          <h2 className="text-[#2E3192] text-[24px] font-semibold mb-6 text-left">
            Influencer sign up
          </h2>

          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className={`w-full h-9 px-3 mb-2 border rounded-[10px] text-sm ${disabledStyle(
              unlock.name
            )}`}
            disabled={!unlock.name}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mb-2">{errors.fullName}</p>
          )}

          {/* Email + OTP */}
          <div className={`flex gap-2 mb-2 ${disabledStyle(unlock.email)}`}>
            <div className="flex w-full border rounded-[10px] overflow-hidden">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
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
                  emailOtpVerified
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
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email}</p>
          )}
          {errors.emailOtp && (
            <p className="text-red-500 text-sm mb-2">{errors.emailOtp}</p>
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

          {/* Phone +91 + OTP */}
          <div className={`flex gap-2 mb-2 ${disabledStyle(unlock.phone)}`}>
            <div className="flex w-full border rounded-[10px] overflow-hidden">
              <span className="bg-gray-200 px-3 flex items-center text-sm select-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit number"
                className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
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
                  form.phone.length !== 10
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
            <p className="text-red-500 text-sm mb-2">{errors.phone}</p>
          )}
          {errors.phoneOtp && (
            <p className="text-red-500 text-sm mb-2">{errors.phoneOtp}</p>
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

          {/* Gender + DOB */}
          <div className={`flex gap-4 mb-1 ${disabledStyle(unlock.genderDob)}`}>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
              disabled={!unlock.genderDob}
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
              className="pretty-date w-1/2 h-9 px-3 border rounded-[10px] text-sm"
              max={today}
              disabled={!unlock.genderDob}
            />
          </div>
          {(errors.gender || errors.dob) && (
            <div className="mb-2">
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender}</p>
              )}
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob}</p>
              )}
            </div>
          )}

          {/* Location + Language */}
          <div className={`flex gap-4 mb-2 ${disabledStyle(unlock.locLang)}`}>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
              disabled={!unlock.locLang}
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
              disabled={!unlock.locLang}
            >
              <option value="">Language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          {(errors.location || errors.language) && (
            <div className="mb-2">
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
              {errors.language && (
                <p className="text-red-500 text-sm">{errors.language}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div className={`relative ${disabledStyle(unlock.password)}`}>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPwdFocused(true)}
              onBlur={() => setPwdFocused(false)}
              placeholder="Password"
              className={`w-full h-9 px-3 mb-1 border rounded-[10px] text-sm ${disabledStyle(
                unlock.password
              )}`}
              disabled={!unlock.password}
            />
            {pwdFocused && unlock.password && (
              <div className="absolute left-0 top-[42px] z-10 w-[min(520px,90vw)] bg-white rounded-[10px] border shadow-lg p-3 text-xs text-gray-800">
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
                  isPasswordValid ? "text-green-700" : "text-gray-500"
                }`}
              >
                Must be 8+ chars with uppercase, lowercase, number & special
                character.
              </div>
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mb-2">{errors.password}</p>
          )}

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className={`w-full h-9 px-3 mb-2 border rounded-[10px] text-sm ${disabledStyle(
              unlock.confirm
            )}`}
            disabled={!unlock.confirm}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mb-2">
              {errors.confirmPassword}
            </p>
          )}

          {/* Terms */}
          <div
            className={`flex justify-center items-center gap-2 mb-4 ${disabledStyle(
              unlock.terms
            )}`}
          >
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              disabled={!unlock.terms}
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
            <p className="text-red-500 text-sm mb-2 text-center">
              {errors.termsAccepted}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-10 bg-[#2E3192] hover:bg-[#1f2270] text-white text-sm font-medium rounded-[8px]"
            disabled={!unlock.submit}
          >
            Create Free Account
          </button>

          <p className="text-center text-sm mt-4">
            Already have an Account?{" "}
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

        {/* Styled-JSX: Date input polish + calendar icon */}
        <style jsx>{`
          input.pretty-date {
            appearance: none;
            -webkit-appearance: none;
            background-color: #fff;
            position: relative;
            padding-right: 40px;
            background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='4' width='18' height='17' rx='2' stroke='%232E3192' stroke-width='2'/%3E%3Cpath d='M8 2v4M16 2v4M3 10h18' stroke='%232E3192' stroke-width='2'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
          }
          input.pretty-date::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0;
            position: absolute;
            right: 10px;
            width: 20px;
            height: 20px;
          }
          input.pretty-date::-webkit-datetime-edit {
            padding: 0.25rem 0 0.25rem 0;
          }
        `}</style>
      </div>
    </>
  );
}
