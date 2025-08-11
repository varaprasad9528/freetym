import Header from "@/components/Header";
import Link from "next/link";

export default function SignUpPage() {
  const options = [
    { label: "Influencer", href: "/signup/influencer" },
    { label: "Brand", href: "/signup/brand" },
    { label: "Agency", href: "/signup/agency" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8F0" }}>
      <Header />

      <div className="flex flex-col items-center justify-start mt-24">
        {/* Heading */}
        <h1
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "64px",
            lineHeight: "100%",
            color: "#2E3192",
            textAlign: "center",
          }}
        >
          Pick What Fits You Best
        </h1>

        {/* Option Boxes */}
        <div className="flex gap-[50px] mt-12 flex-wrap justify-center">
          {options.map(({ label, href }) => (
            <Link href={href} key={label}>
              <div className="w-[350px] h-[120px] rounded-[32px] border border-[#2E3192] bg-[#F0EDFF] text-[#2E3192] flex items-center justify-center transition-all duration-300 hover:bg-[#2E3192] hover:text-white cursor-pointer">
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    fontSize: "54px",
                    lineHeight: "100%",
                    textAlign: "center",
                    width: "161px",
                    height: "81px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
