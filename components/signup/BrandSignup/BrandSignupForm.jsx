"use client";
import { useState } from "react";

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

export default function BrandSignupPage() {
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
  });

  const [errors, setErrors] = useState({});

  const industryTypes = ["Fashion", "Technology", "Fitness", "Beauty"];
  const locations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      alert("Form submitted (mock)");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-6 py-8 font-[Poppins]">
      <div className="flex flex-col lg:flex-row items-start justify-start gap-6 lg:gap-10 max-w-[1280px] mx-auto">
        <div className="flex flex-col w-full max-w-[480px]">
          {/* Signup Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-black rounded-[10px] p-6 w-full shadow-md"
          >
            <h2 className="text-[#2E3192] text-[18px] font-bold mb-6">
              Brands signup
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
              placeholder="Company / Brand Name"
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
                />
                <button type="button" className="bg-gray-200 px-3 text-sm">
                  Get OTP
                </button>
              </div>
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mb-2">{errors.email}</p>
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
                />
                <button type="button" className="bg-gray-200 px-3 text-sm">
                  Get OTP
                </button>
              </div>
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mb-2">{errors.phone}</p>
            )}

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
              <p className="text-red-500 text-xs mb-4">
                {errors.termsAccepted}
              </p>
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

          <div className="mt-3 w-full overflow-x-hidden">
            <div className="relative whitespace-nowrap">
              <div className="flex animate-marquee-slow gap-4 min-w-full px-1">
                {[...testimonials, ...testimonials].map((t, idx) => (
                  <div
                    key={idx}
                    className="min-w-[240px] max-w-[245px] h-[115px] flex flex-col justify-between rounded-[10px] border border-[#FFE0BC] bg-[#FFE0BC] shadow"
                  >
                    <div
                      className="p-3 pb-1 text-[14px] text-gray-800 font-[500] break-words whitespace-normal"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {t.text}
                    </div>
                    <div className="flex justify-between items-center px-3 py-1 bg-white rounded-b-[10px] text-[13px] border-t">
                      <span className="font-[500] text-gray-700">
                        {t.client}
                      </span>
                      <span className="text-gray-400">{t.position}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
                src="/brand-logos.png"
                alt="Trusted by leading brands"
                className="h-20 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
