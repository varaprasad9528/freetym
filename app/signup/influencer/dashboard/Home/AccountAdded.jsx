"use client";
import { useState } from "react";

function ConfirmationPopup({ email, onVerify, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#FFF8F0] rounded-xl p-8 shadow-xl w-full max-w-md flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
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
              onVerify();
            }}
          >
            click on the verification link
          </a>{" "}
          in your email to activate your account
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [account, setAccount] = useState("");
  const [accountAdded, setAccountAdded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mockEmail = "userid@email.com";
  const mockUserId = "Userid";

  const handleAccountSelect = (e) => {
    setAccount(e.target.value);
    if (e.target.value.trim()) {
      setTimeout(() => setShowConfirm(true), 400);
    }
  };

  const handleVerify = () => {
    setShowConfirm(false);
    setAccountAdded(true);
  };

  const handleRemoveAccount = () => {
    setAccountAdded(false);
    setAccount("");
    setSelectedPlatform(null);
  };

  return (
    <div className="bg-[#FFF8F0] w-full min-h-screen">
      <header className="h-14 bg-black text-white flex items-center justify-center text-sm font-semibold">
        Content Goes Here (if any)
      </header>
      <main className="p-12">
        <h2 className="text-xl font-semibold mb-2">
          Let’s add your account(s)
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          We need this information to review your account and generate your
          initial insights.
        </p>
        <div className="mb-6">
          <p className="text-sm font-medium mb-4">Choose your platform</p>
          <div className="flex gap-6">
            {/* Instagram */}
            <div
              onClick={() => !accountAdded && setSelectedPlatform("Instagram")}
              className="relative cursor-pointer transition"
              style={{
                width: "258px",
                height: "82px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: "20px",
                border:
                  selectedPlatform === "Instagram"
                    ? "2px solid #222"
                    : "1px solid #bbb",
                boxShadow:
                  selectedPlatform === "Instagram" ? "0 0 0 2px #eee" : "none",
                opacity: selectedPlatform === "Instagram" ? 1 : 0.93,
                pointerEvents: accountAdded ? "none" : "auto",
                position: "relative",
              }}
            >
              <img
                src="/insta.svg"
                alt="Instagram"
                style={{ width: "30px", height: "30px", marginRight: 14 }}
              />
              <span style={{ fontWeight: 500, fontSize: 28 }}>Instagram</span>
              {selectedPlatform === "Instagram" && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "14px",
                    zIndex: 2,
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#08D948"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      strokeWidth="2"
                      fill="#fff"
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
              onClick={() => !accountAdded && setSelectedPlatform("YouTube")}
              className="relative cursor-pointer transition"
              style={{
                width: "258px",
                height: "82px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                borderRadius: "20px",
                border:
                  selectedPlatform === "YouTube"
                    ? "2px solid #222"
                    : "1px solid #bbb",
                boxShadow:
                  selectedPlatform === "YouTube" ? "0 0 0 2px #eee" : "none",
                opacity: selectedPlatform === "YouTube" ? 1 : 0.93,
                pointerEvents: accountAdded ? "none" : "auto",
                position: "relative",
              }}
            >
              <img
                src="/youtube.svg"
                alt="YouTube"
                style={{ width: "30px", height: "30px", marginRight: 14 }}
              />
              <span style={{ fontWeight: 500, fontSize: 28 }}>Youtube</span>
              {selectedPlatform === "YouTube" && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "14px",
                    zIndex: 2,
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#08D948"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      strokeWidth="2"
                      fill="#fff"
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
        {selectedPlatform && !accountAdded && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Select account
            </label>
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none"
                value={account}
                onChange={handleAccountSelect}
              />
              <span className="absolute left-2 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
        )}
        {accountAdded && (
          <div className="mt-6 flex flex-col items-start max-w-md w-full mx-auto">
            <label className="block text-sm font-medium mb-2">
              My accounts
            </label>
            <div className="flex items-center bg-[#F7F7F7] rounded-lg px-4 py-2 border w-full mb-6">
              {/* User Icon */}
              <span className="mr-3 text-xl text-[#5F3DC4] flex items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12Zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5Z" />
                </svg>
              </span>
              <span className="flex-1 text-gray-800 font-medium">
                {mockUserId}
              </span>
              <button
                className="ml-3 text-gray-400 hover:text-red-500 flex items-center"
                title="Remove account"
                onClick={handleRemoveAccount}
              >
                {/* Delete Icon (SVG) */}
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect
                    x="9"
                    y="9"
                    width="6"
                    height="8"
                    rx="1"
                    strokeWidth="1.6"
                  />
                  <path d="M10 6h4m-8 2h12M17 6v2M7 6v2" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
            <div className="flex w-full">
              <div style={{ width: "90px" }} />
              <button
                className="bg-[#3A36DB] hover:bg-[#2B2ACF] text-white py-3 rounded-md font-semibold text-lg transition"
                style={{ width: "250px" }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </main>
      {showConfirm && (
        <ConfirmationPopup
          email={mockEmail}
          onVerify={handleVerify}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
