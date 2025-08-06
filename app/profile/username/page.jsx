"use client";
import { useState } from "react";

// Dummy async check (simulate API call)
function checkUsernameAvailable(username) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!username) resolve(null);
      else if (username.toLowerCase() === "username123") resolve(false);
      else resolve(true);
    }, 700);
  });
}

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setUsername(value);
    setAvailable(null);
    if (value) {
      setChecking(true);
      const isAvailable = await checkUsernameAvailable(value);
      setAvailable(isAvailable);
      setChecking(false);
    }
  };

  const canSubmit = available === true && !checking;

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

      {/* Main Content */}
      <div className="px-10 py-10">
        <h2 className="text-lg font-bold mb-10">Username</h2>
        <form
          className="max-w-3xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            // Submit logic here
          }}
        >
          <div className="mb-2">
            <label
              className="block mb-1 text-sm font-semibold"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              autoComplete="off"
            />
          </div>
          {/* Status message */}
          {username && !checking && available === true && (
            <div className="mb-3 text-xs text-green-600">
              Username is available
            </div>
          )}
          {username && !checking && available === false && (
            <div className="mb-3 text-xs text-red-500">
              Username is not available
            </div>
          )}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-10 py-2 rounded-md font-semibold text-base transition
                ${
                  canSubmit
                    ? "bg-[#F16623] text-white cursor-pointer"
                    : "bg-[#FEBB97] text-white cursor-not-allowed"
                }
              `}
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
