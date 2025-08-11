"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

function VerifiedPill() {
  return (
    <span className="bg-[#F16623] text-white text-xs font-semibold rounded-full px-4 py-1 flex items-center gap-1 ml-2">
      Verified <CheckCircle2 size={16} className="ml-1" />
    </span>
  );
}

function VerifyPill({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#F16623] text-white text-xs font-semibold rounded-full px-4 py-1 flex items-center gap-1 ml-2"
    >
      Verify
    </button>
  );
}

export default function ContactDetailsPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  // OTP Modal state (for demo, inline not modal)
  const [otpMode, setOtpMode] = useState(null);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState({
    whatsapp: false,
    email: false,
  });

  // Demo: fake verify OTP (always success if any value entered)
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp) return;
    setVerified((v) => ({ ...v, [otpMode]: true }));
    setOtpMode(null);
    setOtp("");
  };

  return (
    <div>
      {/* Header bar */}
      <div
        className="w-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "54px",
          marginBottom: "24px",
        }}
      ></div>
      <div className="px-10 py-2">
        <h2 className="text-lg font-bold mb-10">Contact Details</h2>
        <form className="max-w-3xl mx-auto">
          {/* Whatsapp Number */}
          <div className="mb-5 relative">
            <label
              className="block mb-1 text-sm font-semibold"
              htmlFor="whatsapp"
            >
              Whatsapp Number
            </label>
            <div className="flex items-center">
              <input
                id="whatsapp"
                type="text"
                value={whatsapp}
                disabled={verified.whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Enter your WhatsApp number"
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              />
              {verified.whatsapp ? (
                <VerifiedPill />
              ) : (
                <VerifyPill onClick={() => setOtpMode("whatsapp")} />
              )}
            </div>
          </div>
          {/* Email */}
          <div className="mb-8 relative">
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
                <VerifyPill onClick={() => setOtpMode("email")} />
              )}
            </div>
          </div>
          {/* OTP input area (shows when verifying) */}
          {otpMode && (
            <form
              onSubmit={handleOtpSubmit}
              className="mb-6 flex items-center gap-3"
            >
              <label className="text-sm font-semibold">
                Enter OTP sent to{" "}
                {otpMode === "whatsapp" ? "WhatsApp" : "Email"}:
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="px-3 py-2 border rounded bg-white text-sm"
                placeholder="Enter OTP"
              />
              <button
                type="submit"
                className="bg-[#F16623] text-white px-4 py-2 rounded-md font-semibold text-xs"
              >
                Verify
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
            </form>
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
