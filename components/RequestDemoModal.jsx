"use client";
import { useRef, useState } from "react";

export default function RequestDemoModal({ open, onClose }) {
  const overlayRef = useRef();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!open) return null;

  // Validate fields
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
    )
      errs.email = "Enter a valid email.";
    if (!form.phone.trim()) errs.phone = "Phone Number is required.";
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
      errs.phone = "Enter a valid 10-digit phone number.";
    if (!form.role) errs.role = "Role is required.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    // Simulate async submit, replace with actual API call if needed
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        company: "",
        message: "",
      });
    }, 1200);
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
          {/* Phone */}
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#353376] text-sm ${
                errors.phone ? "border-red-500" : ""
              }`}
              value={form.phone}
              onChange={handleChange}
            />
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
              <option>Brand</option>
              <option>Influencer</option>
              <option>Other</option>
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
