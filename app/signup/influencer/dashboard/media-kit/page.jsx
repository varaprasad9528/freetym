// app/signup/influencer/dashboard/media-kit/page.jsx

export default function MediaKitPage() {
  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Header */}
      <div
        className="flex items-center h-[64px] bg-white px-6"
        style={{
          boxShadow: "0px 4px 4px 0px #00000040",
        }}
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
          Media Kit
        </h1>
      </div>

      {/* Main content */}
      <div className="bg-[#FFF7F0] min-h-full px-4 py-8">
        <h2 className="text-center text-2xl md:text-3xl font-semibold mb-6">
          Effortlessly create a professional media kit <br />
          to impress brands and partners.
        </h2>

        <div className="flex justify-center mb-8">
          <button
            className="px-8 py-2 rounded-md text-white font-semibold"
            style={{ background: "#F16623" }}
          >
            Create my media kit
          </button>
        </div>

        {/* Wider Cards Container */}
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-[#CECECE] p-6 w-[260px] flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                <svg width="32" height="32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#E0E0E0" />
                </svg>
              </div>
              <div className="w-full flex items-center justify-between">
                <span className="font-semibold text-base">UserName</span>
                <span className="bg-[#ECE6FD] text-[#7463AB] text-xs font-medium px-3 py-0.5 rounded-full">
                  2.1k Views
                </span>
              </div>
              <div className="text-gray-400 text-xs mt-2 w-full text-left">
                halfprofilelink.com
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
