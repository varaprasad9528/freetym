"use client";
import { useEffect, useMemo, useState } from "react";

function buildAuthHeaders(extra = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

const usernameRegex = /^[a-z0-9_]{3,20}$/; // letters, numbers, underscore, 3–20 chars

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const [current, setCurrent] = useState(""); // current username from server
  const [loading, setLoading] = useState(true); // initial GET
  const [submitting, setSubmitting] = useState(false);

  const [msg, setMsg] = useState(""); // success message
  const [err, setErr] = useState(""); // error message (ui-visible, except token)

  // Prefill from profile (if your GET returns username)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      setMsg("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        console.error("No token provided.");
        setLoading(false);
        return;
      }

      try {
        const r = await fetch("/api/profile", {
          headers: buildAuthHeaders(),
        });
        const js = await r.json();

        if (r.status === 401 || js?.message === "No token provided.") {
          console.error("No token provided.");
          setLoading(false);
          return;
        }
        if (!r.ok) {
          setErr(js?.message || "Failed to load profile.");
          setLoading(false);
          return;
        }

        const data = js?.data || js;
        const u = data?.username || "";
        setCurrent(u);
        setUsername(u);
      } catch {
        setErr("Network error while loading profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Client validation
  const usernameError = useMemo(() => {
    if (!username) return "";
    if (!usernameRegex.test(username))
      return "Use 3–20 characters: lowercase letters, numbers, or underscore.";
    return "";
  }, [username]);

  const canSubmit =
    !loading &&
    !submitting &&
    !!username &&
    !usernameError &&
    username !== current;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!canSubmit) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      console.error("No token provided.");
      return;
    }

    try {
      setSubmitting(true);
      const r = await fetch("/api/profile/username", {
        method: "PUT",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ username }),
      });
      const js = await r.json();

      if (r.status === 401 || js?.message === "No token provided.") {
        console.error("No token provided.");
        return;
      }

      if (!r.ok) {
        // Backend contract:
        //  - { error: "Username already taken" }
        //  - or { message: "..." } for other errors
        const serverErr = js?.error || js?.message || "Update failed.";
        setErr(serverErr);
        return;
      }

      // Success: { message: "Username updated" }
      setMsg(js?.message || "Username updated");
      setCurrent(username);
    } catch {
      setErr("Network error while updating username.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header bar */}
      <div
        className="w-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "50px",
          marginBottom: "24px",
        }}
      ></div>

      {/* Main Content */}
      <div className="px-10 py-2">
        <h2 className="text-lg font-bold mb-10">Username</h2>

        {loading ? (
          <div className="text-sm text-gray-600 mb-4">Loading...</div>
        ) : (
          <>
            {err && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {err}
              </div>
            )}
            {msg && (
              <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                {msg}
              </div>
            )}
          </>
        )}

        <form className="max-w-3xl mx-auto" onSubmit={onSubmit}>
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
              onChange={(e) => {
                setUsername(e.target.value.trim().toLowerCase());
                setErr("");
                setMsg("");
              }}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              autoComplete="off"
            />
          </div>

          {/* Inline validation */}
          {username && usernameError && (
            <div className="mb-3 text-xs text-red-500">{usernameError}</div>
          )}
          {username && !usernameError && username !== current && (
            <div className="mb-3 text-xs text-gray-600">
              This username looks valid. Click Submit to update.
            </div>
          )}
          {username && username === current && (
            <div className="mb-3 text-xs text-gray-500">
              This is already your current username.
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-10 py-2 rounded-md font-semibold text-base transition
                ${
                  canSubmit
                    ? "bg-[#F16623] text-white cursor-pointer hover:bg-[#d95312]"
                    : "bg-[#FEBB97] text-white cursor-not-allowed"
                }
              `}
            >
              {submitting ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
