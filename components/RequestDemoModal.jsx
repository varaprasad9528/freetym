"use client";
import { useRef, useState } from "react";

export default function RequestDemoModal({ open, onClose }) {
  const overlayRef = useRef();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "", // store only the 10-digit part here
    role: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  if (!open) return null;

  // Email validator (one '@', no consecutive dots, valid local + domain + TLD)
  const isValidEmail = (email) => {
    const str = email.trim();
    if (!str || str.includes("..")) return false;
    const parts = str.split("@");
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || !domain) return false;
    if (!/^[A-Za-z0-9._%+-]+$/.test(local)) return false;
    if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$/.test(domain)) return false;
    return true;
  };

  // Validate fields
  const validate = () => {
    const errs = {};
    const nameTrim = form.name.trim();

    if (!nameTrim) {
      errs.name = "Full Name is required.";
    } else if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(nameTrim)) {
      errs.name = "Name must contain letters only.";
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
    }

    if (!form.role) errs.role = "Role is required.";

    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerError("");
  };

  // Keep only digits; show last 10; user types without +91 (we render +91 prefix in UI)
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(-10);
    setForm({ ...form, phone: digits });
    setErrors({ ...errors, phone: undefined });
    setServerError("");
  };

  const ENDPOINT = "/demo-requests";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        // Submit with +91 prefix as requested
        phone: `+91${form.phone}`,
        company: form.company.trim(),
        role: form.role, // "brand" | "influencer" | "other"
        message: form.message.trim(),
      };

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok || (data && data.success === false)) {
        const msg =
          (data && (data.message || data.error)) ||
          `Request failed (${res.status})`;
        throw new Error(msg);
      }

      // Success → close & reset
      onClose?.();
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        company: "",
        message: "",
      });
    } catch (err) {
      setServerError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-[450px] max-w-[95vw] border border-gray-200">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-xl text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

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

        <form className="space-y-3" onSubmit={handleSubmit} autoComplete="off">
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
              <div className="text-xs text-red-500 mt-0.5">{errors.name}</div>
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
              <div className="text-xs text-red-500 mt-0.5">{errors.email}</div>
            )}
          </div>

          {/* Phone with +91 prefix */}
          <div>
            <div className="flex">
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
            {errors.phone && (
              <div className="text-xs text-red-500 mt-0.5">{errors.phone}</div>
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
              <div className="text-xs text-red-500 mt-0.5">{errors.role}</div>
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

          {/* Message */}
          <div>
            <textarea
              name="message"
              placeholder="Message"
              rows={3}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm resize-none"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#353376] hover:bg-[#23215b] text-white font-medium rounded py-2 mt-2 transition disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
