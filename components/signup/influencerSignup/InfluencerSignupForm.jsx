// app/(wherever)/InfluencerSignupForm.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

// --- Change this if your backend origin differs ---
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
const API = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

// safe JSON reader
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function OtpPopup({
  open,
  onClose,
  onVerify,
  otp,
  setOtp,
  timer,
  onResend,
  type,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Enter {type} OTP</h3>
        <input
          autoFocus
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Enter OTP"
        />
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            onClick={onVerify}
          >
            Verify
          </button>
          <button className="text-gray-500 underline" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="text-sm text-gray-700 flex items-center justify-between">
          {timer > 0 ? (
            <span>Resend in {timer}s</span>
          ) : (
            <button className="text-blue-600 underline" onClick={onResend}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useMemo(() => ({ current: null }), []);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlight(0);
    }
  }, [open]);

  const commit = (val) => {
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div
      className={`relative ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      ref={(el) => (wrapRef.current = el)}
    >
      {/* Input / button */}
      <div
        className={`flex items-center h-9 px-3 border rounded-[10px] text-sm bg-white ${
          disabled ? "pointer-events-none" : "cursor-text"
        }`}
        onClick={() => !disabled && setOpen(true)}
      >
        <input
          type="text"
          className="w-full outline-none bg-transparent placeholder:text-gray-400"
          placeholder={value ? value : placeholder}
          value={query}
          onChange={(e) => {
            if (!open) setOpen(true);
            setQuery(e.target.value);
            setHighlight(0);
          }}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) =>
                Math.min(h + 1, Math.max(filtered.length - 1, 0))
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length) commit(filtered[highlight]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              commit("");
            }}
            aria-label="Clear"
            title="Clear"
          >
            ×
          </button>
        )}
        <span className="ml-2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-[10px] shadow-lg max-h-56 overflow-auto">
          {filtered.length ? (
            filtered.map((opt, i) => (
              <div
                key={opt}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  i === highlight ? "bg-indigo-50" : ""
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(opt);
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InfluencerSignupForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    location: "",
    language: "",
    termsAccepted: false,
    password: "",
    confirmPassword: "",
    emailOtp: "",
    phoneOtp: "",
  });

  const [errors, setErrors] = useState({});
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);

  const [emailOtpTimer, setEmailOtpTimer] = useState(0);
  const [phoneOtpTimer, setPhoneOtpTimer] = useState(0);

  const [pwdFocused, setPwdFocused] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [confirmPwdFocused, setConfirmPwdFocused] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();

  const genders = ["Male", "Female", "Other"];
  const allLocations = [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Ramagundam",
    "Secunderabad",
    "Nalgonda",
    "Adilabad",
    "Suryapet",
    "Miryalaguda",
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Kolkata",
    "Chennai",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Surat",
    "Patna",
    "Indore",
    "Guwahati",
    "Kochi",
    "Gurgaon",
    "Rajkot",
    "Malappuram",
    "Chandigarh",
    "Thiruvananthapuram",
    "Noida",
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Rajamahendravaram",
    "Kurnool",
    "Kakinada",
    "Kadapa",
    "Tirupati",
    "Mangalagiri–Tadepalli",
    "Anantapur",
    "Ongole",
    "Vizianagaram",
    "Eluru",
    "Proddatur",
    "Nandyal",
    "Adoni",
    "Madanapalle",
    "Machilipatnam",
    "Tenali",
    "Chittoor",
    "Hindupur",
    "Srikakulam",
    "Bhimavaram",
    "Tadepalligudem",
    "Guntakal",
    "Dharmavaram",
    "Gudivada",
    "Narasaraopet",
    "Kadiri",
    "Tadipatri",
    "Chilakaluripet",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Ambattur",
    "Tiruppur",
    "Avadi",
    "Thanjavur",
    "Pallavaram",
    "Dindigul",
    "Vellore",
    "Tambaram",
    "Cuddalore",
    "Alandur",
    "Kancheepuram",
    "Erode",
    "Tiruvannamalai",
    "Kumbakonam",
    "Rajapalayam",
    "Nagapattinam",
    "Sholinganallur",
    "Sivakasi",
    "Karur",
    "Karaikkudi",
    "Neyveli",
    "Mysuru",
    "Hubli-Dharwad",
    "Mangaluru",
    "Belagavi",
    "Kalaburagi",
    "Davanagere",
    "Ballari",
    "Vijayapura",
    "Shivamogga",
    "Tumakuru",
    "Raichur",
    "Bidar",
    "Hassan",
    "Hosapete",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Alappuzha",
    "Kottayam",
    "Kannur",
    "Palakkad",
    "Pathanamthitta",
    "Idukki",
    "Kasaragod",
    "Ernakulam",
    "Wayanad",
    "Nagpur",
    "Nashik",
    "Aurangabad",
    "Thane",
    "Pimpri-Chinchwad",
    "Kalyan-Dombivli",
    "Vasai-Virar",
    "Navi Mumbai",
    "Solapur",
    "Bhiwandi",
    "Sangli",
    "Jalgaon",
    "Akola",
    "Latur",
    "Dhule",
    "Ahmednagar",
    "Chandrapur",
    "Parbhani",
    "Ichalkaranji",
    "Jalna",
    "Bhusaval",
    "Panvel",
    "Satara",
    "Beed",
    "Yavatmal",
    "Gondia",
    "Osmanabad",
    "Wardha",
    "Ratnagiri",
    "Vadodara (Baroda)",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Navsari",
    "Morbi",
    "Surendranagar",
    "Bharuch",
    "Gandhidham",
    "Nadiad",
    "Valsad",
    "Patan",
    "Mehsana",
    "Bhuj",
    "Veraval",
    "Porbandar",
    "Botad",
    "Amreli",
    "Gondal",
    "Jetpur",
    "Deesa",
    "Palanpur",
    "Kalol",
    "Godhra",
    "Himmatnagar",
    "Howrah",
    "Hooghly",
    "Midnapur",
    "Bardhaman",
    "Parganas",
    "Durgapur",
    "Asansol",
    "Malda",
    "Baharampur",
    "Kharagpur",
    "Shantipur",
    "Dankuni",
    "Habra",
    "Ranaghat",
    "Dhuliian",
    "Haldia",
    "Raiganj",
    "Krishnanagar",
    "Medinipur",
    "Jalpaiguri",
    "Balurghat",
    "Basirhat",
    "Bankura",
    "Chakdaha",
    "Darjeeling",
    "Alipurduar",
    "Purulia",
    "Jangipur",
    "Bolpur",
    "Bangaon",
    "Cooch Behar",
    "Haridwar",
    "Roorkee",
    "Haldwani",
    "Rudrapur",
    "Kashipur",
    "Rishikesh",
    "Pithoragarh",
    "Bareilly",
    "Manglaur",
    "Saharanpur",
    "Jaspur",
    "Kotdwara",
    "Nainital",
    "Almora",
    "Mussoorie",
    "Bhimtal",
    "Champawat",
    "Doonagiri",
    "Gaurikund",
    "Gopeshwar",
    "Guptakashi",
    "Joshimath",
    "Karanprayag",
    "Khirsu",
    "Naukuchiatal",
    "Uttarkashi",
    "Lansdowne",
    "Kausani",
    "Ranikhet",
    "Valley of Flower",
    "Yamunotri",
    "Gangotri",
    "Badrinath",
    "Kedarnath",
    "Kanpur",
    "Ghaziabad",
    "Agra",
    "Meerut",
    "Varanasi",
    "Prayagraj",
    "Moradabad",
    "Aligarh",
    "Gorakhpur",
    "Firozabad",
    "Muzaffarnagar",
    "Mathura",
    "Shahjahanpur",
    "Rampur",
    "Allahabad",
    "Loni",
    "Agartala",
    "Dharmanagar",
    "Belonia",
    "Ambassa",
    "Kailashahar",
    "Bishalgarh",
    "Teliamura",
    "Khowai",
    "Melaghar",
    "Jirania",
    "Gangtok",
    "Mangan",
    "Gyalshing",
    "Namchi",
    "Pakyong",
    "Singtam",
    "Rangpo",
    "Nayabazar",
    "Rhenock",
    "Jodhpur",
    "Kota",
    "Ajmer",
    "Udaipur",
    "Bikaner",
    "Alwar",
    "Sikar",
    "Bharatpur",
    "Bhilwara",
    "Hanumangarh",
    "Jaisalmer",
    "Tonk",
    "Beawar",
    "Bhiwadi",
    "Abohar",
    "Phagwara",
    "Muktsar",
    "Barnala",
    "Batala",
    "Pathankot",
    "Maler Kotla",
    "Khanna",
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Ajitgarh",
    "Hoshiarpur",
    "Moga",
    "Firozpur",
    "Kapurthala",
    "Zirakpur",
    "Rajpura",
    "Kot Kapura",
    "Sangrur",
    "Faridkot",
    "Mansa",
    "Gobindgarh",
    "Mohali",
    "Cuttack",
    "Rourkela",
    "Brahmapur",
    "Sambalpur",
    "Puri",
    "Balasore",
    "Bhadrak",
    "Baripada",
    "Jajpur",
    "Rayagada",
    "Jharsuguda",
    "Bargarh",
    "Bhawanipatna",
    "Balangir",
    "Paradip",
    "Dhenkanal",
    "Jatani",
    "Kendujhar",
    "Byasanagar",
    "Rajagangapur",
    "Sunabeda",
    "Koraput",
    "Dimapur",
    "Kohima",
    "Mokokchung",
    "Aizawl",
    "Lunglei",
    "Saiha",
    "Champhai",
    "Kolasib",
    "Serchhip",
    "Saitual",
    "Khawzawl",
    "Vairengte",
    "Shillong",
    "Tura",
    "Jowai",
    "Nongstoin",
    "Baghmara",
    "Resubelpara",
    "Mawlai",
    "Mairang",
    "Nongpoh",
    "Williamnagar",
    "Cherrapunjee",
    "Imphal",
    "Churachandpur",
    "Thoubal",
    "Kakching",
    "Kangpokpi",
    "Bishnupur",
    "Jiribam",
    "Kamjong",
    "Senapati",
    "Pherzawl",
    "Ukhrul",
    "Nambol",
    "Lilong",
    "Jamshedpur",
    "Dhanbad",
    "Ranchi",
    "Bokaro Steel City",
    "Deoghar",
    "Phusro",
    "Hazaribagh",
    "Giridih",
    "Ramgarh",
    "Medininagar",
    "Chaibasa",
    "Lohardaga",
    "Chakradharpur",
    "Madhupur",
    "Chatra",
    "Godda",
    "Koderma",
    "Garhwa",
    "Gumla",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam",
    "Rewa",
    "Chhindwara",
    "Burhanpur",
    "Khandwa",
    "Vidisha",
    "Khargone",
    "Neemuch",
    "Betul",
    "Sehore",
    "Shivpuri",
    "Shimla",
    "Manali",
    "Dharamshala",
    "Mandi",
    "Kullu",
    "Solan",
    "Bilaspur",
    "Palampur",
    "Hamirpur",
    "Una",
    "Nahan",
    "Panaji",
    "Vasco da Gama",
    "Margao (Madgaon)",
    "Mapusa",
    "Ponda",
    "Curchorem",
    "Bicholim",
    "Pernem",
    "Canacona",
    "Quepem",
    "Sanguem",
    "Sanquelim",
    "Valpoi",
    "Sancoale",
    "Raipur",
    "Bhilai",
    "Bilaspur",
    "Korba",
    "Raj Nandgaon",
    "Raigarh",
    "Jagdalpur",
    "Ambikapur",
    "Dhamtari",
    "Chirmiri",
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Nalanda",
    "Purnia",
    "Ara",
    "Begusarai",
    "Chapra",
    "Munger",
    "Saharsa",
    "Bettiah",
    "Hajipur",
    "Sasaram",
    "Dehri",
    "Siwan",
    "Motihari",
    "Buxar",
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Nagaon",
    "Tezpur",
    "Tinsukia",
    "Diphu",
    "Kokrajhar",
    "Karimganj",
    "Dhubri",
    "Goalpara",
    "Sivasagar",
    "North Lakhimpur",
    "Haflong",
    "Bongaigaon",
  ];

  const locations = Array.from(new Set(allLocations)).sort();

  const languages = [
    "English",
    "Bengali",
    "Dogri",
    "Gujarati",
    "Hindi",
    "Kannada",
    "Kashmiri",
    "Konkani",
    "Malayalam",
    "Manipuri",
    "Marathi",
    "Nepali",
    "Odia",
    "Punjabi",
    "Tamil",
    "Telugu",
    "Urdu",
  ];

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Regex / checks
  const nameRegex = /^[A-Za-z ]{3,35}$/;
  const emailRegex = /\S+@\S+\.\S+/;

  const hasMinLen = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const isPasswordValid =
    hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const isNameValid = useMemo(
    () => nameRegex.test(form.fullName.trim()),
    [form.fullName]
  );
  const isEmailValid = useMemo(
    () => emailRegex.test(form.email.trim()),
    [form.email]
  );
  const isGenderDobValid = useMemo(
    () => !!form.gender && !!form.dob && form.dob <= today,
    [form.gender, form.dob, today]
  );
  const isLocLangValid = useMemo(
    () => !!form.location && !!form.language,
    [form.location, form.language]
  );
  const isConfirmValid =
    form.confirmPassword && form.confirmPassword === form.password;

  const unlock = {
    name: true,
    email: isNameValid,
    phone: emailOtpVerified,
    genderDob: phoneOtpVerified,
    locLang: isGenderDobValid,
    password: isLocLangValid,
    confirm: isPasswordValid,
    terms: isConfirmValid,
    submit: form.termsAccepted,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "phone") v = String(v).replace(/\D/g, "").slice(0, 10);

    setForm((prev) => ({ ...prev, [name]: v }));

    setErrors((prev) => {
      const next = { ...prev };

      if (name === "fullName") {
        if (!v.trim()) next.fullName = "Full Name is required";
        else if (!nameRegex.test(v.trim()))
          next.fullName = "Name must be 3–35 letters (only alphabets & spaces)";
        else delete next.fullName;
      }

      if (name === "email") {
        if (!v.trim()) next.email = "Email is required";
        else if (!emailRegex.test(v.trim()))
          next.email = "Enter a valid email address";
        else delete next.email;
        // clear server-side "taken" while typing
        delete next.businessEmailTaken;
      }

      if (name === "dob") {
        if (!v) next.dob = "Date of Birth is required";
        else if (v > today) next.dob = "Date of Birth cannot be in the future";
        else delete next.dob;
      }

      if (name === "password") {
        if (!v) next.password = "Password is required";
        else delete next.password;
      }

      if (name === "confirmPassword") {
        if (!v) next.confirmPassword = "Please confirm your password";
        else if (v !== form.password)
          next.confirmPassword = "Passwords do not match";
        else delete next.confirmPassword;
      }

      if (name === "phone") {
        if (!v) next.phone = "Phone Number is required";
        else if (v.length !== 10) next.phone = "Enter 10-digit number";
        else delete next.phone;
        // clear server-side "taken" while typing
        delete next.phoneTaken;
      }

      return next;
    });
  };

  // timers
  useEffect(() => {
    let id = null;
    if (emailOtpSent && emailOtpTimer > 0)
      id = setInterval(() => setEmailOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [emailOtpSent, emailOtpTimer]);

  useEffect(() => {
    let id = null;
    if (phoneOtpSent && phoneOtpTimer > 0)
      id = setInterval(() => setPhoneOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phoneOtpSent, phoneOtpTimer]);

  // Clear verification errors when verified (belt & suspenders)
  useEffect(() => {
    if (emailOtpVerified) {
      setErrors((er) => {
        const { emailOtp, ...rest } = er;
        return rest;
      });
    }
  }, [emailOtpVerified]);
  useEffect(() => {
    if (phoneOtpVerified) {
      setErrors((er) => {
        const { phoneOtp, ...rest } = er;
        return rest;
      });
    }
  }, [phoneOtpVerified]);

  // --- API: Email OTP ---
  const sendEmailOtp = async () => {
    if (!isEmailValid) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          role: "influencer",
        }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        const msg = (data?.message || "").toLowerCase();
        if (msg.includes("already registered")) {
          setErrors((e) => ({
            ...e,
            businessEmailTaken: "Email already registered",
          }));
          setEmailOtpSent(false);
          setEmailOtpTimer(60);
          return;
        }
        setErrors((e) => ({
          ...e,
          businessEmailTaken: data?.message || "Failed to send email OTP",
        }));
        return;
      }

      // success
      setErrors((e) => {
        const { businessEmailTaken, ...rest } = e;
        return rest;
      });
      setEmailOtpSent(true);
      setEmailOtpTimer(60);
    } catch {
      setErrors((e) => ({
        ...e,
        businessEmailTaken: "Failed to send email OTP",
      }));
    }
  };

  const resendEmailOtp = async () => {
    await sendEmailOtp();
  };

  const verifyEmailOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          role: "influencer",
          otp: form.emailOtp,
          email: form.email,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      const data = await res.json().catch(() => ({}));
      if (data && data.success === false)
        throw new Error(data.message || "Invalid OTP");
      setEmailOtpVerified(true);
      setShowEmailOtpPopup(false);
      // clear “verify email” error
      setErrors((er) => {
        const { emailOtp, ...rest } = er;
        return rest;
      });
    } catch (e) {
      setErrors((er) => ({
        ...er,
        emailOtp: e.message || "Invalid Email OTP",
      }));
    }
  };

  // --- API: Phone OTP ---
  const sendPhoneOtp = async () => {
    if (form.phone.length !== 10) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${form.phone}`, email: form.email }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        const msg = (data?.message || "").toLowerCase();
        if (msg.includes("already registered")) {
          setErrors((e) => ({
            ...e,
            phoneTaken: "Mobile number already registered",
          }));
          setPhoneOtpSent(false);
          setPhoneOtpTimer(0);
          return;
        }
        setErrors((e) => ({
          ...e,
          phoneTaken: data?.message || "Failed to send phone OTP",
        }));
        setPhoneOtpSent(false);
        setPhoneOtpTimer(0);
        return;
      }

      // Success: clear errors and show OTP field
      setErrors((e) => {
        const { phoneTaken, ...rest } = e;
        return rest;
      });
      setPhoneOtpSent(true);
      setPhoneOtpTimer(60);
    } catch {
      setErrors((e) => ({ ...e, phoneTaken: "Failed to send phone OTP" }));
      setPhoneOtpSent(false);
      setPhoneOtpTimer(0);
    }
  };

  const resendPhoneOtp = async () => {
    await sendPhoneOtp();
  };

  const verifyPhoneOtp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: `+91${form.phone}`,
          otp: form.phoneOtp,
        }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setPhoneOtpVerified(true);
      setShowPhoneOtpPopup(false);
      // clear “verify phone” error
      setErrors((er) => {
        const { phoneOtp, ...rest } = er;
        return rest;
      });
    } catch (e) {
      setErrors((er) => ({
        ...er,
        phoneOtp: e.message || "Invalid Phone OTP",
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full Name is required";
    else if (!nameRegex.test(form.fullName.trim()))
      errs.fullName = "Name must be 3–35 letters (only alphabets & spaces)";

    if (!form.email) errs.email = "Email is required";
    else if (!emailRegex.test(form.email.trim()))
      errs.email = "Enter a valid email address";

    if (!form.phone) errs.phone = "Phone Number is required";
    else if (form.phone.length !== 10) errs.phone = "Enter 10-digit number";

    if (!form.gender) errs.gender = "Gender is required";
    if (!form.dob) errs.dob = "Date of Birth is required";
    else if (form.dob > today)
      errs.dob = "Date of Birth cannot be in the future";

    if (!form.location) errs.location = "Location is required";
    if (!form.language) errs.language = "Language is required";

    if (!form.password) errs.password = "Password is required";
    else if (!isPasswordValid)
      errs.password = "Password doesn’t meet requirements";

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match";

    if (!emailOtpVerified) errs.emailOtp = "Please verify your email OTP";
    if (!phoneOtpVerified) errs.phoneOtp = "Please verify your phone OTP";
    if (!form.termsAccepted) errs.termsAccepted = "You must accept the terms";
    return errs;
  };

  const completeRegistration = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        phone: `+91${form.phone}`,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        gender: form.gender,
        dob: form.dob,
        location: form.location,
        language: form.language,
        termsAccepted: String(!!form.termsAccepted),
      };

      const res = await fetch(`${API_BASE}/api/auth/register/influencer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      setShowSuccessPopup(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        location: "",
        language: "",
        termsAccepted: false,
        password: "",
        confirmPassword: "",
        emailOtp: "",
        phoneOtp: "",
      });
      setEmailOtpSent(false);
      setPhoneOtpSent(false);
      setEmailOtpVerified(false);
      setPhoneOtpVerified(false);
      setEmailOtpTimer(0);
      setPhoneOtpTimer(0);
      setErrors({}); // Show success popup
    } catch (e) {
      alert(e.message || "Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) setErrors(errs);
    else {
      setErrors({});
      await completeRegistration();
    }
  };

  const disabledStyle = (enabled) =>
    enabled ? "" : "opacity-60 cursor-not-allowed";

  return (
    <>
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />

      <div className="flex flex-col lg:flex-row items-start justify-center gap-16 px-6 py-12 font-[Poppins] bg-[#FFF8F0]">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black rounded-[20px] p-6 w-[662px] shadow-md"
        >
          <h2 className="text-[#2E3192] text-[24px] font-semibold mb-6 text-left">
            Influencer sign up
          </h2>
          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className={`w-full h-9 px-3 mb-2 border rounded-[10px] text-sm ${disabledStyle(
              unlock.name
            )}`}
            disabled={!unlock.name}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mb-2">{errors.fullName}</p>
          )}
          {/* Email + OTP */}
          <div className={`flex gap-2 mb-2 ${disabledStyle(unlock.email)}`}>
            <div className="flex w-full border rounded-[10px] overflow-hidden">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
                disabled={!unlock.email || emailOtpVerified}
              />
              <button
                type="button"
                className="bg-gray-200 px-3 text-sm"
                onClick={() => unlock.email && isEmailValid && sendEmailOtp()}
                disabled={
                  !unlock.email ||
                  !isEmailValid ||
                  emailOtpSent ||
                  emailOtpVerified ||
                  !!errors.businessEmailTaken
                }
              >
                {emailOtpVerified
                  ? "Verified"
                  : emailOtpSent
                  ? "Sent"
                  : "Get OTP"}
              </button>
            </div>
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email}</p>
          )}
          {errors.businessEmailTaken && (
            <p className="text-red-500 text-sm mb-2">
              {errors.businessEmailTaken}
            </p>
          )}
          {errors.emailOtp && (
            <p className="text-red-500 text-sm mb-2">{errors.emailOtp}</p>
          )}
          {emailOtpSent && !emailOtpVerified && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={form.emailOtp}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    emailOtp: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                className="w-48 border rounded px-3 py-2 text-sm" // <-- wider input
                placeholder="Enter OTP"
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                onClick={verifyEmailOtp}
                type="button"
              >
                Verify
              </button>
              {emailOtpTimer > 0 ? (
                <span className="text-gray-500 text-sm">
                  Resend in {emailOtpTimer}s
                </span>
              ) : (
                <button
                  className="text-blue-600 underline text-sm"
                  onClick={resendEmailOtp}
                  type="button"
                >
                  Resend OTP
                </button>
              )}
              <button
                className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm"
                type="button"
                onClick={() => {
                  setEmailOtpSent(false);
                  setForm((f) => ({ ...f, emailOtp: "" }));
                  setEmailOtpTimer(0);
                }}
              >
                Cancel
              </button>
            </div>
          )}
          {/* Phone +91 + OTP */}
          <div className={`flex gap-2 mb-2 ${disabledStyle(unlock.phone)}`}>
            <div className="flex w-full border rounded-[10px] overflow-hidden">
              <span className="bg-gray-200 px-3 flex items-center text-sm select-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit number"
                className="flex-grow h-9 px-3 text-sm border-none focus:outline-none"
                disabled={!unlock.phone || phoneOtpVerified}
                inputMode="numeric"
                pattern="\d*"
              />
              <button
                type="button"
                className="bg-gray-200 px-3 text-sm"
                onClick={() =>
                  unlock.phone && form.phone.length === 10 && sendPhoneOtp()
                }
                disabled={
                  !unlock.phone ||
                  phoneOtpSent ||
                  phoneOtpVerified ||
                  form.phone.length !== 10 ||
                  !!errors.phoneTaken
                }
              >
                {phoneOtpVerified
                  ? "Verified"
                  : phoneOtpSent
                  ? "Sent"
                  : "Get OTP"}
              </button>
            </div>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mb-2">{errors.phone}</p>
          )}
          {errors.phoneTaken && (
            <p className="text-red-500 text-sm mb-2">{errors.phoneTaken}</p>
          )}
          {errors.phoneOtp && (
            <p className="text-red-500 text-sm mb-2">{errors.phoneOtp}</p>
          )}
          {phoneOtpSent && !phoneOtpVerified && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={form.phoneOtp}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phoneOtp: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                className="w-48 border rounded px-3 py-2 text-sm" // <-- wider input
                placeholder="Enter OTP"
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                onClick={verifyPhoneOtp}
                type="button"
              >
                Verify
              </button>
              {phoneOtpTimer > 0 ? (
                <span className="text-gray-500 text-sm">
                  Resend in {phoneOtpTimer}s
                </span>
              ) : (
                <button
                  className="text-blue-600 underline text-sm"
                  onClick={resendPhoneOtp}
                  type="button"
                >
                  Resend OTP
                </button>
              )}
              <button
                className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm"
                type="button"
                onClick={() => {
                  setPhoneOtpSent(false);
                  setForm((f) => ({ ...f, phoneOtp: "" }));
                  setPhoneOtpTimer(0);
                }}
              >
                Cancel
              </button>
            </div>
          )}
          {/* Gender + Date of Birth */}
          <div className={`flex gap-4 mb-1 ${disabledStyle(unlock.genderDob)}`}>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-1/2 h-9 px-3 border rounded-[10px] text-sm"
              disabled={!unlock.genderDob}
            >
              <option value="">Gender</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <div className="dob-wrap relative w-1/2">
              {!form.dob && (
                <span className="dob-ph pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Date of Birth
                </span>
              )}
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="pretty-date w-full h-9 px-3 border rounded-[10px] text-sm"
                max={today}
                disabled={!unlock.genderDob}
              />
            </div>
          </div>
          {(errors.gender || errors.dob) && (
            <div className="mb-2">
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender}</p>
              )}
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob}</p>
              )}
            </div>
          )}
          {/* Location + Language */}
          <div className={`flex gap-4 mb-2 ${disabledStyle(unlock.locLang)}`}>
            <div className="w-1/2">
              <SearchableSelect
                options={locations}
                value={form.location}
                disabled={!unlock.locLang}
                placeholder="Location"
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, location: val }))
                }
              />
            </div>

            <div className="w-1/2">
              <SearchableSelect
                options={languages}
                value={form.language}
                disabled={!unlock.locLang}
                placeholder="Language"
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, language: val }))
                }
              />
            </div>
          </div>
          {(errors.location || errors.language) && (
            <div className="mb-2">
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
              {errors.language && (
                <p className="text-red-500 text-sm">{errors.language}</p>
              )}
            </div>
          )}
          {/* Password */}
          <div className={`relative ${disabledStyle(unlock.password)}`}>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full h-9 px-3 mb-1 border rounded-[10px] text-sm ${disabledStyle(
                unlock.password
              )}`}
              disabled={!unlock.password}
            />
            {form.password && !isPasswordValid && (
              <div className="text-xs text-gray-600 mb-2">
                Password must be 8+ chars, include uppercase, lowercase, number
                & special character.
              </div>
            )}
            {isPasswordValid && (
              <div className="text-[11px] mb-2 text-green-700">
                Password meets all requirements.
              </div>
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mb-2">{errors.password}</p>
          )}
          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className={`w-full h-9 px-3 mb-2 border rounded-[10px] text-sm ${disabledStyle(
              unlock.confirm
            )}`}
            disabled={!unlock.confirm}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mb-2">
              {errors.confirmPassword}
            </p>
          )}
          {/* Terms */}
          <div
            className={`flex justify-center items-center gap-2 mb-4 ${disabledStyle(
              unlock.terms
            )}`}
          >
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              disabled={!unlock.terms}
            />
            <span className="text-sm">
              Accept our{" "}
              <a href="#" className="text-blue-600 underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 underline">
                Privacy Policy
              </a>
            </span>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-500 text-sm mb-2 text-center">
              {errors.termsAccepted}
            </p>
          )}
          {/* Submit */}
          <button
            type="submit"
            className="w-full h-10 bg-[#2E3192] hover:bg-[#1f2270] text-white text-sm font-medium rounded-[8px]"
            disabled={!unlock.submit}
          >
            Create Free Account
          </button>
          <p className="text-center text-sm mt-4">
            Already have an Account?{" "}
            <a
              href="#"
              className="text-[#2E3192] underline"
              onClick={(e) => {
                e.preventDefault();
                setOpenLogin(true);
              }}
            >
              Sign In
            </a>
          </p>
        </form>

        {/* Right Text Section */}
        <div className="max-w-[644px] mt-2">
          <h1 className="text-[33px] font-medium text-black leading-[100%] mb-6 text-center">
            Make Social Media Growth <br /> Fun, Motivating & Rewarding
          </h1>
          <p className="text-[20px] font-normal leading-[140%] text-black text-left max-w-[844px]">
            At Freetym, we help you turn your free time into pay time. Whether
            you're an aspiring creator or a seasoned influencer, our platform
            connects you with top brands, boosts your growth on Instagram and
            YouTube, and helps you earn doing what you love. Start your journey
            with Freetym — where content becomes a career.
          </p>
          <ul className="mt-6 space-y-2 text-[18px] text-black font-normal text-left">
            <li>🏆 Showcase your profile & achievements</li>
            <li>📣 Get more brand collaborations & visibility</li>
            <li>📈 Analyze & monitor your social media stats</li>
            <li>📝 Apply Unlimited campaigns</li>
            <li>🤝 Work with multiple brands.</li>
            <li>💰 Earn what you deserve.</li>
            <li>✅ 100% transparent.</li>
          </ul>
        </div>

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4 text-green-700">
                Account Created!
              </h2>
              <p className="mb-6 text-gray-700 text-center">
                Your account is successfully created.
              </p>
              <button
                className="bg-[#2E3192] text-white px-6 py-2 rounded font-medium"
                onClick={() => {
                  setShowSuccessPopup(false);
                  setOpenLogin(true);
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          input.pretty-date {
            appearance: none;
            -webkit-appearance: none;
            background-color: #fff;
            position: relative;
            padding-right: 40px;
            background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='4' width='18' height='17' rx='2' stroke='%232E3192' stroke-width='2'/%3E%3Cpath d='M8 2v4M16 2v4M3 10h18' stroke='%232E3192' stroke-width='2'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
          }
          .dob-wrap input.pretty-date {
            padding-left: 36px;
          }
          .dob-wrap .dob-ph {
            z-index: 10;
          }
          input.pretty-date::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0;
            position: absolute;
            right: 10px;
            width: 20px;
            height: 20px;
          }
          input.pretty-date::-webkit-datetime-edit {
            padding: 0.25rem 0 0.25rem 0;
          }
          input.pretty-date[value=""]::-webkit-datetime-edit,
          input.pretty-date[value=""]::-webkit-datetime-edit-text,
          input.pretty-date[value=""]::-webkit-datetime-edit-month-field,
          input.pretty-date[value=""]::-webkit-datetime-edit-day-field,
          input.pretty-date[value=""]::-webkit-datetime-edit-year-field {
            color: transparent;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
      </div>
    </>
  );
}
