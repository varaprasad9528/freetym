"use client";
import { useState } from "react";

export default function AddressDetailsPage() {
  const [form, setForm] = useState({
    country: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
  });

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

      <div className="px-10 py-10">
        <h2 className="text-lg font-bold mb-10">Address Details</h2>
        <form className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
            {/* Country */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="Country"
              />
            </div>
            {/* State */}
            <div>
              <label className="block mb-1 text-sm font-semibold">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="State"
              />
            </div>
            {/* City */}
            <div>
              <label className="block mb-1 text-sm font-semibold">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="City"
              />
            </div>
            {/* Pincode */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                Pincode
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pincode: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="Pincode"
              />
            </div>
          </div>
          {/* Address */}
          <div className="mb-8">
            <label className="block mb-1 text-sm font-semibold">Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              placeholder="Enter Address"
            />
          </div>
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#F16623] hover:bg-[#d95312] text-white px-10 py-2 rounded-md font-semibold text-base"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
