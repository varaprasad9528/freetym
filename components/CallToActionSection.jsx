import { ArrowUpRight } from "lucide-react";

export default function CallToActionSection() {
  return (
    <div className="relative">
      {/* Orange Background Section */}
      <section
        className="px-6 pb-32 flex flex-col items-center"
        style={{
          backgroundColor: "#F79966",
          paddingTop: "80px",
          paddingBottom: "100px",
        }}
      >
        <div
          className="text-center"
          style={{
            width: "703px",
            maxWidth: "100%",
          }}
        >
          <h2
            className="text-black mb-4"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "48px",
              fontWeight: 700,
              lineHeight: "100%",
              textAlign: "center",
            }}
          >
            A Single Platform for All Your
            <br />
            Influencer Marketing Needs
          </h2>
          <p className="text-white text-base opacity-90 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <div className="flex space-x-4 justify-center">
            <button className="bg-[#2E3192] hover:bg-blue-800 text-white px-6 py-3 rounded-md text-base font-bold transition-colors">
              Request Demo
            </button>
            <button className="bg-[#2E3192] hover:bg-blue-800 text-white px-6 py-3 rounded-md text-base font-bold transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Overlapping Button Row */}
      <div className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 flex flex-col md:flex-row gap-6 md:gap-12 z-10">
        <button className="flex items-center justify-center gap-2 px-10 py-6 rounded-xl shadow-md transition hover:shadow-lg hover:-translate-y-1 bg-[#EFEFF7] hover:bg-[#2E3192] group">
          <span className="text-[#2E3192] group-hover:text-white text-xl md:text-2xl font-semibold transition-colors">
            For Brands
          </span>
          <ArrowUpRight className="w-6 h-6 text-[#2E3192] group-hover:text-white transition-colors" />
        </button>
        <button className="flex items-center justify-center gap-2 px-10 py-6 rounded-xl shadow-md transition hover:shadow-lg hover:-translate-y-1 bg-[#EFEFF7] hover:bg-[#2E3192] group">
          <span className="text-[#2E3192] group-hover:text-white text-xl md:text-2xl font-semibold transition-colors">
            For Agencies
          </span>
          <ArrowUpRight className="w-6 h-6 text-[#2E3192] group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
