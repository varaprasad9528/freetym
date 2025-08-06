"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const relationshipOptions = [
  "Single",
  "In a relationship",
  "Engaged",
  "Married",
  "In a civil union",
  "In a domestic partnership",
  "In an open relationship",
  "It's complicated",
  "Separated",
  "Divorced",
  "Widowed",
];

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: null,
    gender: "",
    relationship: "",
    about: "",
  });

  return (
    <div className="bg-[#FFF8F0] min-h-screen px-0 py-0">
      {/* HEADER (white bg, shadow) */}
      <div
        className="w-full"
        style={{
          background: "#FFFFFF",
          boxShadow: "0px 4px 4px 0px #00000040",
          height: "54px",
          marginBottom: "24px",
        }}
      ></div>
      {/* Main Content Card */}
      <main className="px-12 py-8">
        <h2 className="text-xl font-bold mb-7">Account Details</h2>
        <form className="flex flex-col gap-6">
          {/* 2x2 grid for top fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* First Name */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="Username"
              />
            </div>
            {/* Last Name */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
                placeholder="Username"
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                Date of Birth
              </label>
              <DatePicker
                selected={form.dob}
                onChange={(date) => setForm((f) => ({ ...f, dob: date }))}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="Click to select a date"
                maxDate={new Date()}
                customInput={
                  <input className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm" />
                }
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 text-sm font-semibold">Gender</label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {/* Relationship Status (full width) */}
          <div>
            <label className="block mb-1 text-sm font-semibold">
              Relationship Status
            </label>
            <select
              value={form.relationship}
              onChange={(e) =>
                setForm((f) => ({ ...f, relationship: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="">Select Relationship</option>
              {relationshipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {/* About (full width) */}
          <div>
            <label className="block mb-1 text-sm font-semibold">About</label>
            <textarea
              rows={3}
              value={form.about}
              onChange={(e) =>
                setForm((f) => ({ ...f, about: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm"
              placeholder="Add something about you"
            />
          </div>
          {/* Submit Button */}
          <div className="text-center mt-3">
            <button
              type="submit"
              className="bg-[#F16623] hover:bg-[#d95312] text-white px-10 py-2 rounded-md font-semibold text-base"
              style={{ minWidth: "150px" }}
            >
              SUBMIT
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
