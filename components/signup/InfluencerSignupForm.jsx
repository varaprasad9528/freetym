"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  });

  const [errors, setErrors] = useState({});
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

    //  Password validations
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
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
    } else {
      setErrors({});
      // Simulate successful submission
      router.push("/dashboard/influencer");
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

        <div className="flex gap-2 mb-4">
          <div className="flex w-full border rounded-[10px] overflow-hidden">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
            />
            <button type="button" className="bg-gray-200 px-3 text-sm">
              Get OTP
            </button>
          </div>
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email}</p>
        )}

        <div className="flex gap-2 mb-4">
          <div className="flex w-full border rounded-[10px] overflow-hidden">
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
            />
            <button type="button" className="bg-gray-200 px-3 text-sm">
              Get OTP
            </button>
          </div>
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mb-2">{errors.phone}</p>
        )}

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
