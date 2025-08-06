"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DiscoverySection from "@/components/DiscoverySection";
import FeatureBlocks from "@/components/FeatureBlocks";
import CareSection from "@/components/CareSection";
import SolutionBlocks from "@/components/SolutionBlocks";
import PressSection from "@/components/PressSection";
import HowFreetymHelps from "@/components/HowFreetymHelps";
import DescriptionSection from "@/components/DescriptionSection";
import StrategyHeading from "@/components/StrategyHeading";
import StrategyContent from "@/components/StrategyContent";
import TrustedBySection from "@/components/TrustedBySection";
import TestimonialSlider from "@/components/TestimonialSlider";
import CallToActionSection from "@/components/CallToActionSection";
import Footer from "@/components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8F0" }}>
      <Header />
      <HeroSection />
      <DiscoverySection />
      <FeatureBlocks />
      <CareSection />
      <SolutionBlocks />
      <PressSection />
      <HowFreetymHelps />
      <DescriptionSection />
      <StrategyHeading />
      <StrategyContent />
      <TrustedBySection />
      <TestimonialSlider />
      <CallToActionSection />
      <Footer />
    </div>
  );
}
