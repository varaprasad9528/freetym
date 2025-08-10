"use client";
import { useEffect, useMemo, useState } from "react";

/** Helper: optional token + userId plumbing.
 *  - If your backend reads userId from auth, you can remove X-User-Id.
 *  - If you store tokens, set Authorization header below.
 */
function buildHeaders(extra = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { "X-User-Id": userId } : {}), // remove if not needed server-side
    ...extra,
  };
}

const MAX_BYTES = 200 * 1024; // 200 KB
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

// Simple validators
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // e.g., ABCDE1234F
const aadhaarRegex = /^\d{12}$/; // 12 digits
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i; // e.g., HDFC0001234
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/; // basic UPI check: something@bank

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("kyc"); // 'kyc' | 'bank' | 'verify'
  const [agreed, setAgreed] = useState(false);

  // --- KYC numbers + files ---
  const [kycForm, setKycForm] = useState({
    pancardNumber: "",
    aadharNumber: "",
  });
  const [files, setFiles] = useState({
    pan: null,
    aadhaarFront: null,
    aadhaarBack: null,
  });
  const [kycErr, setKycErr] = useState({
    pancardNumber: "",
    aadharNumber: "",
    pan: "",
    aadhaarFront: "",
    aadhaarBack: "",
    submit: "",
  });
  const [kycLoading, setKycLoading] = useState(false);

  // --- Bank & UPI ---
  const [bank, setBank] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  });
  const [upi, setUpi] = useState({
    googlePay: "",
    phonePe: "",
    paytm: "",
  });
  const [bankErr, setBankErr] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    googlePay: "",
    phonePe: "",
    paytm: "",
    submit: "",
  });
  const [bankLoading, setBankLoading] = useState(false);

  // --- Status + Balance ---
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({
    kyc: "KYC verification pending!",
    bank: "Bank details verification pending!",
    submitted: false,
    verified: false,
    submittedAt: null,
  });

  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balance, setBalance] = useState({
    available: 0,
    locked: 0,
    kycVerified: false,
    kycSubmitted: false,
    kycStatus: "pending",
  });

  // -------- Lifecycle: fetch status + balance --------
  useEffect(() => {
    (async () => {
      try {
        setStatusLoading(true);
        const res = await fetch("/api/wallet/kyc/status", {
          headers: buildHeaders(),
        });
        const js = await res.json();
        if (js?.success) {
          setStatusMsg({
            kyc: js.data?.status || "KYC verification pending!",
            bank:
              js.data?.bankVerificationStatus ||
              "Bank details verification pending!",
            submitted: !!js.data?.submitted,
            verified: !!js.data?.verified,
            submittedAt: js.data?.submittedAt || null,
          });
        }
      } catch (e) {
        // no-op UI; could show toast
      } finally {
        setStatusLoading(false);
      }

      try {
        setBalanceLoading(true);
        const res = await fetch("/api/wallet/balance", {
          headers: buildHeaders(),
        });
        const js = await res.json();
        if (js?.success) {
          setBalance({
            available: Number(js.data?.available ?? 0),
            locked: Number(js.data?.locked ?? 0),
            kycVerified: !!js.data?.kycVerified,
            kycSubmitted: !!js.data?.kycSubmitted,
            kycStatus: js.data?.kycStatus ?? "pending",
          });
        }
      } catch (e) {
        // no-op
      } finally {
        setBalanceLoading(false);
      }
    })();
  }, []);

  // -------- Handlers --------
  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setKycErr((p) => ({
        ...p,
        [key]: "Allowed: JPG, JPEG, PNG, or PDF.",
      }));
      setFiles((p) => ({ ...p, [key]: null }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setKycErr((p) => ({ ...p, [key]: "File must be under 200 KB." }));
      setFiles((p) => ({ ...p, [key]: null }));
      return;
    }
    setFiles((p) => ({ ...p, [key]: file }));
    setKycErr((p) => ({ ...p, [key]: "" }));
  };

  const validateKyc = () => {
    let ok = true;
    const next = { ...kycErr, submit: "" };

    if (!kycForm.pancardNumber || !panRegex.test(kycForm.pancardNumber)) {
      next.pancardNumber = "Enter a valid PAN (e.g., ABCDE1234F).";
      ok = false;
    } else next.pancardNumber = "";

    if (!kycForm.aadharNumber || !aadhaarRegex.test(kycForm.aadharNumber)) {
      next.aadharNumber = "Enter a valid 12-digit Aadhaar number.";
      ok = false;
    } else next.aadharNumber = "";

    if (!files.pan) {
      next.pan = "PAN file is required.";
      ok = false;
    }
    if (!files.aadhaarFront) {
      next.aadhaarFront = "Aadhaar front image is required.";
      ok = false;
    }
    if (!files.aadhaarBack) {
      next.aadhaarBack = "Aadhaar back image is required.";
      ok = false;
    }

    setKycErr(next);
    return ok;
  };

  const submitKyc = async () => {
    if (!agreed) {
      setKycErr((p) => ({ ...p, submit: "Please accept Terms & Privacy." }));
      return;
    }
    if (!validateKyc()) return;

    try {
      setKycLoading(true);
      setKycErr((p) => ({ ...p, submit: "" }));

      const fd = new FormData();
      fd.append("pancardNumber", kycForm.pancardNumber.toUpperCase());
      fd.append("aadharNumber", kycForm.aadharNumber);
      fd.append("pancardImages", files.pan);
      fd.append("aadharFront", files.aadhaarFront);
      fd.append("aadharBack", files.aadhaarBack);

      const res = await fetch("/api/wallet/kyc", {
        method: "POST",
        headers: buildHeaders(), // form-data: don't set Content-Type
        body: fd,
      });
      const js = await res.json();
      if (js?.success) {
        // Update status immediately to reflect "submitted"
        setStatusMsg((s) => ({
          ...s,
          submitted: true,
          verified: false,
          kyc: "KYC verification pending!",
          submittedAt: new Date().toISOString(),
        }));
        alert(
          js.message ||
            "KYC documents uploaded successfully. Verification pending."
        );
        setActiveTab("bank");
      } else {
        setKycErr((p) => ({
          ...p,
          submit:
            js?.message || "Unable to upload KYC right now. Please try again.",
        }));
      }
    } catch (e) {
      setKycErr((p) => ({
        ...p,
        submit: "Network error. Please try again.",
      }));
    } finally {
      setKycLoading(false);
    }
  };

  const validateBank = () => {
    let ok = true;
    const next = { ...bankErr, submit: "" };

    if (!bank.accountHolderName.trim()) {
      next.accountHolderName = "Account holder name is required.";
      ok = false;
    } else next.accountHolderName = "";

    if (!bank.accountNumber.trim()) {
      next.accountNumber = "Account number is required.";
      ok = false;
    } else next.accountNumber = "";

    if (!bank.bankName.trim()) {
      next.bankName = "Bank name is required.";
      ok = false;
    } else next.bankName = "";

    if (!bank.ifscCode.trim() || !ifscRegex.test(bank.ifscCode)) {
      next.ifscCode = "Enter a valid IFSC (e.g., HDFC0001234).";
      ok = false;
    } else next.ifscCode = "";

    // UPI IDs are optional, but if provided, validate format
    next.googlePay =
      upi.googlePay && !upiRegex.test(upi.googlePay) ? "Invalid UPI ID." : "";
    next.phonePe =
      upi.phonePe && !upiRegex.test(upi.phonePe) ? "Invalid UPI ID." : "";
    next.paytm =
      upi.paytm && !upiRegex.test(upi.paytm) ? "Invalid UPI ID." : "";

    setBankErr(next);
    return ok;
  };

  const submitBankUpi = async () => {
    if (!validateBank()) return;

    try {
      setBankLoading(true);
      setBankErr((p) => ({ ...p, submit: "" }));

      const payload = {
        accountHolderName: bank.accountHolderName.trim(),
        accountNumber: bank.accountNumber.trim(),
        bankName: bank.bankName.trim(),
        ifscCode: bank.ifscCode.toUpperCase(),
        googlePay: upi.googlePay.trim(),
        phonePe: upi.phonePe.trim(),
        paytm: upi.paytm.trim(),
      };

      const res = await fetch("/api/wallet/kyc/bank-upi", {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const js = await res.json();

      if (js?.success) {
        alert(js.message || "Bank and UPI details submitted successfully");
        // Reflect bank verification pending
        setStatusMsg((s) => ({
          ...s,
          bank: "Bank details verification pending!",
        }));
        setActiveTab("verify");
      } else {
        setBankErr((p) => ({
          ...p,
          submit:
            js?.message ||
            "All bank details (accountHolderName, accountNumber, bankName, ifscCode) are required.",
        }));
      }
    } catch (e) {
      setBankErr((p) => ({ ...p, submit: "Network error. Please try again." }));
    } finally {
      setBankLoading(false);
    }
  };

  const total = useMemo(
    () => (Number(balance.available) || 0) + (Number(balance.locked) || 0),
    [balance.available, balance.locked]
  );

  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Header */}
      <div
        className="flex items-center h-[64px] bg-white px-6"
        style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
      >
        <h1 className="pl-10 font-semibold text-2xl leading-none">Wallet</h1>
      </div>

      <div className="p-8">
        {/* Tabs */}
        <div className="flex gap-8 mb-6">
          {[
            { id: "kyc", label: "KYC" },
            { id: "bank", label: "Bank & UPI" },
            { id: "verify", label: "Verification" },
          ].map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveTab(t.id)}
            >
              <span
                className={`font-semibold ${
                  activeTab === t.id ? "text-[#F16623]" : "text-[#A1A1A1]"
                }`}
              >
                {t.label}
              </span>
              <span
                className={`border-t-2 w-8 ${
                  activeTab === t.id ? "border-[#F16623]" : "border-[#A1A1A1]"
                }`}
              ></span>
            </div>
          ))}
        </div>

        {/* --- KYC TAB --- */}
        {activeTab === "kyc" && (
          <>
            {/* Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  PAN Number
                </label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={kycForm.pancardNumber}
                  onChange={(e) =>
                    setKycForm((p) => ({
                      ...p,
                      pancardNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                />
                {kycErr.pancardNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {kycErr.pancardNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="12-digit number"
                  value={kycForm.aadharNumber}
                  onChange={(e) =>
                    setKycForm((p) => ({
                      ...p,
                      aadharNumber: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  maxLength={12}
                  className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                />
                {kycErr.aadharNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {kycErr.aadharNumber}
                  </p>
                )}
              </div>
            </div>

            {/* KYC Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Upload PAN Card
                </label>
                <input
                  id="panUpload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange("pan")}
                />
                <label
                  htmlFor="panUpload"
                  className="w-full bg-white border border-[#E5E5E5] rounded-lg h-14 mb-2 flex items-center justify-center cursor-pointer"
                >
                  {files.pan ? files.pan.name : "Click here to upload"}
                </label>
                {kycErr.pan && (
                  <p className="text-xs text-red-500 mb-2">{kycErr.pan}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Max 200 KB • JPG / PNG / PDF
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Upload Aadhaar (Front)
                </label>
                <input
                  id="aadhaarFrontUpload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange("aadhaarFront")}
                />
                <label
                  htmlFor="aadhaarFrontUpload"
                  className="w-full bg-white border border-[#E5E5E5] rounded-lg h-14 mb-2 flex items-center justify-center cursor-pointer"
                >
                  {files.aadhaarFront
                    ? files.aadhaarFront.name
                    : "Click here to upload"}
                </label>
                {kycErr.aadhaarFront && (
                  <p className="text-xs text-red-500 mb-2">
                    {kycErr.aadhaarFront}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Max 200 KB • JPG / PNG / PDF
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">
                  Upload Aadhaar (Back)
                </label>
                <input
                  id="aadhaarBackUpload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange("aadhaarBack")}
                />
                <label
                  htmlFor="aadhaarBackUpload"
                  className="w-full bg-white border border-[#E5E5E5] rounded-lg h-14 mb-2 flex items-center justify-center cursor-pointer"
                >
                  {files.aadhaarBack
                    ? files.aadhaarBack.name
                    : "Click here to upload"}
                </label>
                {kycErr.aadhaarBack && (
                  <p className="text-xs text-red-500 mb-2">
                    {kycErr.aadhaarBack}
                  </p>
                )}
                <p className="text-[11px] text-gray-400">
                  Max 200 KB • JPG / PNG / PDF
                </p>
              </div>
            </div>

            {/* Terms + Actions */}
            <div className="mb-6">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                I have reviewed and accepted the Terms & Conditions and Privacy
                Policy.
              </label>

              {kycErr.submit && (
                <p className="text-xs text-red-500 mt-2">{kycErr.submit}</p>
              )}

              <div className="mt-4 flex gap-4 justify-center">
                <button
                  onClick={submitKyc}
                  disabled={kycLoading}
                  className={`px-6 py-2 rounded-md font-medium text-white ${
                    kycLoading
                      ? "bg-[#F16623]/60 cursor-not-allowed"
                      : "bg-[#F16623] hover:opacity-90"
                  }`}
                >
                  {kycLoading ? "Uploading..." : "Save & Continue"}
                </button>
              </div>
            </div>

            <WalletBalance
              loading={balanceLoading}
              available={balance.available}
              locked={balance.locked}
              total={total}
            />
          </>
        )}

        {/* --- BANK & UPI TAB --- */}
        {activeTab === "bank" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
              {/* Bank (shifted right slightly as asked) */}
              <div className="max-w-[380px] pl-8">
                <h3 className="font-semibold mb-3">Add Bank Details</h3>
                <div className="space-y-3">
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                    placeholder="Account Holder Name"
                    value={bank.accountHolderName}
                    onChange={(e) =>
                      setBank((p) => ({
                        ...p,
                        accountHolderName: e.target.value,
                      }))
                    }
                  />
                  {bankErr.accountHolderName && (
                    <p className="text-xs text-red-500">
                      {bankErr.accountHolderName}
                    </p>
                  )}
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                    placeholder="Account Number"
                    value={bank.accountNumber}
                    onChange={(e) =>
                      setBank((p) => ({
                        ...p,
                        accountNumber: e.target.value.replace(/\s/g, ""),
                      }))
                    }
                  />
                  {bankErr.accountNumber && (
                    <p className="text-xs text-red-500">
                      {bankErr.accountNumber}
                    </p>
                  )}
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                    placeholder="Bank Name"
                    value={bank.bankName}
                    onChange={(e) =>
                      setBank((p) => ({ ...p, bankName: e.target.value }))
                    }
                  />
                  {bankErr.bankName && (
                    <p className="text-xs text-red-500">{bankErr.bankName}</p>
                  )}
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm uppercase"
                    placeholder="IFSC Code"
                    value={bank.ifscCode}
                    onChange={(e) =>
                      setBank((p) => ({
                        ...p,
                        ifscCode: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                  {bankErr.ifscCode && (
                    <p className="text-xs text-red-500">{bankErr.ifscCode}</p>
                  )}
                </div>
              </div>

              {/* OR Divider */}
              <div className="relative hidden md:block self-stretch">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#E5E5E5]" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFF7F0] px-2 text-xs font-semibold text-[#A1A1A1]">
                  OR
                </span>
              </div>

              {/* UPI (shifted right slightly as asked) */}
              <div className="max-w-[380px] pl-8">
                <h3 className="font-semibold mb-3">Add UPI</h3>
                <div className="space-y-3">
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                    placeholder="Google Pay (Enter UPI ID)"
                    value={upi.googlePay}
                    onChange={(e) =>
                      setUpi((p) => ({ ...p, googlePay: e.target.value }))
                    }
                  />
                  {bankErr.googlePay && (
                    <p className="text-xs text-red-500">{bankErr.googlePay}</p>
                  )}
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                    placeholder="PhonePe (Enter UPI ID)"
                    value={upi.phonePe}
                    onChange={(e) =>
                      setUpi((p) => ({ ...p, phonePe: e.target.value }))
                    }
                  />
                  {bankErr.phonePe && (
                    <p className="text-xs text-red-500">{bankErr.phonePe}</p>
                  )}
                  <input
                    className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
                    placeholder="Paytm (Enter UPI ID)"
                    value={upi.paytm}
                    onChange={(e) =>
                      setUpi((p) => ({ ...p, paytm: e.target.value }))
                    }
                  />
                  {bankErr.paytm && (
                    <p className="text-xs text-red-500">{bankErr.paytm}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit & Nav */}
            {bankErr.submit && (
              <p className="text-sm text-red-500 mt-4">{bankErr.submit}</p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveTab("kyc")}
                className="px-6 py-2 rounded-md font-medium text-[#F16623] bg-white border border-[#F16623] hover:bg-[#FFF1E9]"
              >
                Back
              </button>
              <button
                onClick={submitBankUpi}
                disabled={bankLoading}
                className={`px-6 py-2 rounded-md font-medium text-white ${
                  bankLoading
                    ? "bg-[#F16623]/60 cursor-not-allowed"
                    : "bg-[#F16623] hover:opacity-90"
                }`}
              >
                {bankLoading ? "Submitting..." : "Submit Bank & UPI"}
              </button>
            </div>

            <WalletBalance
              loading={balanceLoading}
              available={balance.available}
              locked={balance.locked}
              total={total}
            />
          </>
        )}

        {/* --- VERIFY TAB --- */}
        {activeTab === "verify" && (
          <>
            <h3 className="font-semibold mb-4">KYC and Bank Verification</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div className="bg-[#D9D9D9] rounded-md px-4 py-3 text-sm font-medium text-[#24292F]">
                {statusLoading ? "Loading..." : statusMsg.kyc}
              </div>
              <div className="bg-[#D9D9D9] rounded-md px-4 py-3 text-sm font-medium text-[#24292F]">
                {statusLoading ? "Loading..." : statusMsg.bank}
              </div>
            </div>

            <button
              onClick={() => setActiveTab("bank")}
              className="px-6 py-2 rounded-md font-medium text-[#F16623] bg-white border border-[#F16623] hover:bg-[#FFF1E9] mb-6"
            >
              Back
            </button>

            <WalletBalance
              loading={balanceLoading}
              available={balance.available}
              locked={balance.locked}
              total={total}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* Shared Wallet Balance */
function WalletBalance({ loading, available, locked, total }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Wallet Balance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col">
          <span className="text-xs text-gray-500 mb-2 font-medium">
            Available Balance
          </span>
          <span className="text-[#F16623] text-2xl font-bold mb-2">
            {loading ? "—" : `₹${Number(available).toFixed(2)}`}
          </span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col">
          <span className="text-xs text-gray-500 mb-2 font-medium">
            Locked Balance
          </span>
          <span className="text-[#F16623] text-2xl font-bold mb-2">
            {loading ? "—" : `₹${Number(locked).toFixed(2)}`}
          </span>
          <span className="text-xs text-gray-400">
            Funds reserved for pending campaign offers.
          </span>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col">
          <span className="text-xs text-gray-500 mb-2 font-medium">
            Total Balance
          </span>
          <span className="text-[#F16623] text-2xl font-bold mb-2">
            {loading ? "—" : `₹${Number(total).toFixed(2)}`}
          </span>
          <span className="text-xs text-gray-400">
            Available + Locked Funds
          </span>
        </div>
      </div>
    </div>
  );
}
