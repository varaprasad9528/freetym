import Header from "@/components/Header";
import InfluencerSignupForm from "@/components/signup/InfluencerSignup/InfluencerSignupForm";
import CreatorFeatureSection from "@/components/signup/InfluencerSignup/CreatorFeatureSection";
import Footer from "@/components/Footer";

export default function InfluencerPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8F0" }}>
      <Header />

      {/* Top Header Text */}
      <div className="flex items-center justify-center pt-10 px-4 w-full">
        <div className="text-center max-w-[1165px]">
          <div
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              fontSize: "36px",
              lineHeight: "100%",
              color: "#2E3192",
            }}
          >
            Convert Your{" "}
            <span style={{ color: "#F26522" }}>Free Time to Pay Time</span>
          </div>
          <div
            style={{
              marginTop: "24px",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              fontSize: "36px",
              lineHeight: "100%",
              color: "#2E3192",
            }}
          >
            with India's Biggest Influencer Marketing Platform Freetym
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <div className="pt-6 px-6 flex justify-center">
        <div className="ml-[40px]">
          <InfluencerSignupForm />
        </div>
      </div>

      {/* Creator Feature Section */}
      <div className="mb-[-40px]">
        <CreatorFeatureSection />
      </div>

      {/* Footer */}
      <div className="[&_*]:pt-0">
        <Footer userType="influencer" />
      </div>
    </div>
  );
}
