export default function WalletPage() {
  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Header */}
      <div
        className="flex items-center h-[64px] bg-white px-6"
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
        >
          Wallet
        </h1>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Tabs */}
        <div className="flex gap-8 mb-6">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#F16623] font-semibold border-b-2 border-[#F16623] pb-1">
              KYC
            </span>
            <span className="border-t-2 border-[#F16623] w-8"></span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#A1A1A1] font-semibold">Bank & UPI</span>
            <span className="border-t-2 border-[#A1A1A1] w-8"></span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#A1A1A1] font-semibold">Verification</span>
            <span className="border-t-2 border-[#A1A1A1] w-8"></span>
          </div>
        </div>

        {/* KYC Upload */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* PAN */}
          <div>
            <label className="block mb-2 text-sm font-semibold">
              Upload PAN Card
            </label>
            <button className="w-full bg-white border border-[#E5E5E5] rounded-lg h-14 mb-2">
              Click here to upload
            </button>
            <input
              type="text"
              placeholder="Enter PAN number"
              className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
            />
          </div>
          {/* Aadhaar Front */}
          <div>
            <label className="block mb-2 text-sm font-semibold">
              Upload Aadhar (Front)
            </label>
            <button className="w-full bg-white border border-[#E5E5E5] rounded-lg h-14 mb-2">
              Click here to upload
            </button>
            <input
              type="text"
              placeholder="Enter Aadhar number"
              className="w-full border border-[#E5E5E5] rounded-lg px-4 py-2 text-sm"
            />
          </div>
          {/* Aadhaar Back */}
          <div>
            <label className="block mb-2 text-sm font-semibold">
              Upload Aadhar (Back)
            </label>
            <button className="w-full bg-white border border-[#E5E5E5] rounded-lg h-14 mb-2">
              Click here to upload
            </button>
          </div>
        </div>

        {/* Terms and Policy */}
        <div className="mb-4">
          <label className="flex items-center text-xs">
            <input type="checkbox" className="mr-2" />I have reviewed and
            accepted the Terms & Conditions and Privacy Policy.
          </label>
        </div>

        {/* Wallet Balance */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Wallet Balance</h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Available Balance */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col">
              <span className="text-xs text-gray-500 mb-2 font-medium">
                Available Balance
              </span>
              <span className="text-[#F16623] text-2xl font-bold mb-2">
                ₹0.00
              </span>
            </div>
            {/* Locked Balance */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col">
              <span className="text-xs text-gray-500 mb-2 font-medium">
                Locked Balance
              </span>
              <span className="text-[#F16623] text-2xl font-bold mb-2">
                ₹0.00
              </span>
              <span className="text-xs text-gray-400">
                Funds reserved for pending campaign offers.
              </span>
            </div>
            {/* Total Balance */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col">
              <span className="text-xs text-gray-500 mb-2 font-medium">
                Total Balance
              </span>
              <span className="text-[#F16623] text-2xl font-bold mb-2">
                ₹0.00
              </span>
              <span className="text-xs text-gray-400">
                Available + Locked Funds
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
