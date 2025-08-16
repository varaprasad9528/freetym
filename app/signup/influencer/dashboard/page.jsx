"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Confirmation Modal as a Popup
function ConfirmationPopup({ email, onVerify, onClose, onResend }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#FFF8F0] rounded-xl p-8 shadow-xl w-full max-w-md flex flex-col items-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        {/* Single Circle + Check SVG */}
        <div className="mb-6 mt-2">
          <svg width="60" height="60" fill="none" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="26"
              stroke="#3A36DB"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M22 31l6 6 10-12"
              stroke="#3A36DB"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#3A36DB] mb-3">
          You’re nearly there!
        </h2>
        <p className="mb-2 text-center text-black">
          We’ve sent a confirmation email to
          <br />
          <span className="font-semibold">{email}</span>
        </p>
        <p className="mb-6 text-center text-gray-700 text-sm">
          Please{" "}
          <a
            href="#"
            className="text-[#3A36DB] underline font-semibold"
            onClick={(e) => {
              e.preventDefault();
              onVerify(); // THIS is what triggers the account added UI
            }}
          >
            click on the verification link
          </a>{" "}
          in your email to activate your account
        </p>
        <button
          className="bg-[#3A36DB] hover:bg-[#2B2ACF] text-white px-8 py-2 rounded-md font-semibold transition"
          onClick={onResend}
        >
          RESEND EMAIL
        </button>
      </div>
    </div>
  );
}

export default function InfluencerDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [account, setAccount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountAdded, setAccountAdded] = useState(false); // <<--- NEW

  const mockEmail = "userid@email.com";
  const mockUserId = "Userid";
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedPlatform) return;
    router.push(
      `/signup/influencer/dashboard/report?platform=${selectedPlatform.toLowerCase()}`
    );
  };

  // Simulate account selection (when anything is typed, popup appears)
  const handleAccountSelect = (e) => {
    setAccount(e.target.value);
    if (e.target.value.trim()) {
      setTimeout(() => setShowConfirm(true), 500);
    }
  };

  // When the user "verifies" email (clicks verification link)
  const handleVerify = () => {
    setShowConfirm(false);
    setAccountAdded(true); // <<--- Set account as added!
  };

  // Remove account handler
  const handleRemoveAccount = () => {
    setAccountAdded(false);
    setAccount("");
    setSelectedPlatform(null);
  };

  return (
    <div className="bg-[#FFF8F0] w-full min-h-screen">
      {/* Header */}
      <header>
        <div
          className="flex items-center h-[50px] bg-white px-6"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "24px",
              lineHeight: "100%",
              margin: 0,
              paddingLeft: "40px",
            }}
          ></h1>
        </div>
      </header>

      {/* Inner Content */}
      <main className="p-12 pl-24">
        <h2 className="text-xl font-semibold mb-2">
          Let’s add your account(s)
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          We need this information to review your account and generate your
          initial insights.
        </p>

        {/* Choose platform */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-4">Choose your platform</p>
          <div className="flex gap-6">
            {/* Instagram */}
            <div
              onClick={() => setSelectedPlatform("Instagram")}
              className="relative cursor-pointer transition"
              style={{
                width: "258px",
                height: "82px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                opacity: selectedPlatform === "Instagram" ? 1 : 0.8,
              }}
            >
              <img
                src="/insta.svg"
                alt="Instagram"
                style={{ width: "258px", height: "82px" }}
              />
              {selectedPlatform === "Instagram" && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    zIndex: 2,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#08D948"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="2"
                      fill="white"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 13l3 3 7-7"
                    />
                  </svg>
                </span>
              )}
            </div>

            {/* YouTube */}
            <div
              onClick={() => setSelectedPlatform("YouTube")}
              className="relative cursor-pointer transition"
              style={{
                width: "258px",
                height: "82px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                opacity: selectedPlatform === "YouTube" ? 1 : 0.8,
              }}
            >
              <img
                src="/youtube.svg"
                alt="YouTube"
                style={{ width: "258px", height: "82px" }}
              />
              {selectedPlatform === "YouTube" && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    zIndex: 2,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#08D948"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="2"
                      fill="white"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 13l3 3 7-7"
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* (Optional) If you still want the type-to-open modal, add an input and bind handleAccountSelect */}
        {/* <input value={account} onChange={handleAccountSelect} className="border px-3 py-2 rounded" placeholder="Search..." /> */}

        {/* After account is added, show My Accounts */}
        {accountAdded && (
          <div className="w-[330px] ml-2">
            <div className="flex items-center bg-[#F7F7F7] rounded-lg px-4 py-2 border w-full">
              <span className="mr-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-3.31 3.134-6 7-6s7 2.69 7 6" />
                </svg>
              </span>
              <span className="flex-1 text-gray-800 font-medium text-base text-left">
                {mockUserId}
              </span>
              <button
                className="ml-3 text-gray-400 hover:text-red-500"
                title="Remove account"
                onClick={handleRemoveAccount}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v3m5 0H6"
                  />
                </svg>
              </button>
            </div>
            <button
              className="w-full bg-[#3A36DB] hover:bg-[#2B2ACF] text-white py-2 rounded-md font-semibold text-lg transition mt-6"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationPopup
          email={mockEmail}
          onVerify={handleVerify}
          onClose={() => setShowConfirm(false)}
          onResend={() => alert("Resent (mock)!")}
        />
      )}
    </div>
  );
}
