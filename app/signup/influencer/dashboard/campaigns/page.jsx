export default function CampaignsPage() {
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
          Campaigns
        </h1>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#CECECE] bg-white px-2">
          <button className="relative py-4 px-1 font-semibold text-black bg-white">
            My campaigns
            <span
              className="absolute left-0 right-0 -bottom-[2px] h-[3px] rounded-full"
              style={{
                background: "#F16623",
                height: "3px",
                width: "60%",
                marginLeft: "20%",
                marginRight: "20%",
                display: "block",
              }}
            ></span>
          </button>

          <button className="py-4 px-1 text-black bg-white">
            Explore campaigns
          </button>
          <button className="py-4 px-1 text-black bg-white">
            Applied campaigns
          </button>
        </div>

        {/* Planning/Ongoing/Completed */}
        <div className="flex gap-2 mb-4 mt-4">
          <button
            className="text-white font-semibold py-1 px-4 rounded-full"
            style={{ background: "#F16623" }}
          >
            Planning
          </button>
          <button className="bg-gray-100 text-gray-700 py-1 px-4 rounded-full">
            Ongoing
          </button>
          <button className="bg-gray-100 text-gray-700 py-1 px-4 rounded-full">
            Completed
          </button>
        </div>

        {/* Info Boxes */}
        <div className="flex gap-4 mb-4">
          <div
            className="bg-white rounded-md p-4 flex-1 text-center"
            style={{ border: "1px solid #CECECE" }}
          >
            <div className="text-xs text-gray-500 mb-1">Active Campaigns</div>
            <div className="text-2xl font-bold">0/0</div>
          </div>
          <div
            className="bg-white rounded-md p-4 flex-1 text-center"
            style={{ border: "1px solid #CECECE" }}
          >
            <div className="text-xs text-gray-500 mb-1">
              Unread Conversations
            </div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div
            className="bg-white rounded-md p-4 flex-[2] text-center"
            style={{ border: "1px solid #CECECE" }}
          >
            <div className="text-xs text-gray-500 mb-1">New Invitations</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-4">
          <select className="bg-white border border-[#CECECE] rounded-md px-3 py-2 text-sm">
            <option>Campaign Status</option>
          </select>
          <select className="bg-white border border-[#CECECE] rounded-md px-3 py-2 text-sm">
            <option>Collaboration Status</option>
          </select>
          <input
            type="text"
            placeholder="Search Brands"
            className="flex-1 bg-white border border-[#CECECE] rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Campaigns Table */}
        <div
          className="bg-white rounded-md shadow p-2 overflow-x-auto"
          style={{ border: "1px solid #CECECE" }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#CECECE]">
                <th className="text-left py-2 px-3 font-semibold">Brands</th>
                <th className="text-left py-2 px-3 font-semibold">
                  Title of the Campaign
                </th>
                <th className="text-left py-2 px-3 font-semibold">
                  Collaboration Status
                </th>
                <th className="text-left py-2 px-3 font-semibold">
                  Application Date
                </th>
                <th className="text-left py-2 px-3 font-semibold">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No campaigns found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
