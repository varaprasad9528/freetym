import Header from "@/components/Header";
import BrandSignupForm from "@/components/signup/AgencySignup/AgencySignupForm";
import Footer from "@/components/Footer";

export default function AgencyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8F0" }}>
      <Header />

      {/* Top Header Text */}
      <div className="flex items-center justify-center pt-10 px-4 w-full">
        <div className="text-center max-w-[1165px]">
          <div
            style={{
              fontFamily: "Poppins",
              fontWeight: 800,
              fontSize: "36px",
              lineHeight: "100%",
              color: "#2E3192",
            }}
          >
            Discover Influencers That Deliver Real Impact
          </div>
          <div
            style={{
              marginTop: "24px",
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "100%",
              color: "#000000",
            }}
          >
            At Freetym, we empower brands and agencies to run smarter, faster,
            and more effective influencer campaigns. Whether you're launching a
            new product or scaling your digital presence, we connect you with
            the right creators on Instagram and YouTube backed by data,
            transparency, and results.
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <div className="pt-6 px-6 flex justify-center">
        <div className="ml-[40px]">
          <BrandSignupForm />
        </div>
      </div>

      {/* Footer */}
      <div className="[&_*]:pt-0">
        <Footer />
      </div>
    </div>
  );
}
