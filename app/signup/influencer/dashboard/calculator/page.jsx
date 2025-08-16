export default function MoneyCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Header with box-shadow */}
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
        >
          Money Calculator
        </h1>
        {/* Optional search bar on the right */}
        <div className="ml-auto w-[250px]">
          <input
            type="text"
            placeholder="Search Brands"
            className="w-full border border-[#CECECE] rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Main Content, centered */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-gray-600">
            Hang tight – This feature is in the works and will be rolled out
            soon!
          </p>
        </div>
      </div>
    </div>
  );
}
