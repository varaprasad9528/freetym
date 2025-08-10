"use client";

import { useRouter } from "next/navigation";
import {
  Search,
  LineChart,
  Target,
  Camera,
  Users,
  BarChart,
  ArrowUpRight,
} from "lucide-react";

export default function FeatureBlocks() {
  const router = useRouter();

  const features = [
    {
      icon: Search,
      title: "Discover the Right Influencers",
      description:
        "Access a powerful and ever growing database of influencers across Instagram, YouTube. Use smart filters to identify creators who truly align with your brand's voice, goals, and audience.",
      buttonText: "Try influencer discovery",
      linkText: "Learn More",
    },
    {
      icon: LineChart,
      title: "Deep Dive Influencer Analytics",
      description:
        "Make data backed decisions with 15+ advanced metrics. Follower authenticity, engagement rate, audience demographics, content performance, and more across all major platforms.",
      buttonText: "Try Influencer Analytics",
      linkText: "Learn More",
    },
    {
      icon: Target,
      title: "Campaign Management",
      description:
        "Plan, execute, and track your campaigns from a single, intuitive dashboard. From shortlisting influencers to creative briefs and real time performance tracking manage everything in one place.",
      buttonText: "Try campaign management",
      linkText: "Learn More",
    },
    {
      icon: Camera,
      title: "Full Production Support",
      description:
        "We go beyond digital coordination our team handles creative direction, video and photo shoot production, editing, and publishing, ensuring high quality branded content every time.",
      buttonText: "Try production Support",
      linkText: "Learn More",
    },
    {
      icon: Users,
      title: "Industry & Competitor Intelligence",
      description:
        "Stay ahead of the game. Monitor your competitors' influencer strategies, benchmark performance, and track emerging trends across industries to make informed, agile marketing decisions.",
      buttonText: "Try competitor intelligence",
      linkText: "Learn More",
    },
    {
      icon: BarChart,
      title: "Post Campaign Analytics & Reporting",
      description:
        "Get detailed performance breakdowns reach, impressions, conversions, ROI, and custom KPIs. Use visual reports to understand what worked and optimise your future campaigns with clarity.",
      buttonText: "Try campaign analytics",
      linkText: "Learn More",
    },
  ];

  const handleDiscoveryClick = () => {
    console.log("[FeatureBlocks] Clicked: Try influencer discovery");

    const hero = document.getElementById("hero-section");
    console.log("[FeatureBlocks] hero-section found?", !!hero);

    if (hero) {
      const searchBar = document.getElementById("influencer-search-input");
      if (searchBar) {
        searchBar.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        hero.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      console.log("[FeatureBlocks] Called scrollIntoView on hero-section");

      setTimeout(() => {
        const input = document.getElementById("influencer-search-input");
        console.log(
          "[FeatureBlocks] influencer-search-input found after timeout?",
          !!input
        );
        if (input && typeof input.focus === "function") {
          input.focus();
          console.log("[FeatureBlocks] input.focus() called successfully");
        } else {
          console.warn(
            "[FeatureBlocks] input NOT found. Check id='influencer-search-input'"
          );
        }
      }, 600);
    } else {
      console.warn("[FeatureBlocks] hero-section NOT found. Navigating.");
      sessionStorage.setItem("focusInfluencerSearch", "1");
      router.push("/#hero-section");
    }
  };

  return (
    <section className="px-6 py-16" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-xl p-8 flex flex-col items-center text-center shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{
              maxWidth: "483px",
              backgroundColor: "#FFD1B8",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="mb-6 p-4 rounded-full bg-orange-100">
              <feature.icon className="w-10 h-10 text-orange-500" />
            </div>

            <h3
              className="text-2xl font-semibold mb-4"
              style={{ color: "#2E3192" }}
            >
              {feature.title}
            </h3>

            <p className="text-gray-600 mb-3">{feature.description}</p>

            <button
              className="bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors mb-3 hover:bg-white hover:text-blue-700 border border-blue-700"
              onClick={index === 0 ? handleDiscoveryClick : undefined}
            >
              {index === 0 &&
                console.log("[FeatureBlocks] onClick attached to first card")}
              {feature.buttonText}
            </button>

            <a
              href="#"
              className="text-blue-700 hover:underline text-sm font-medium flex items-center gap-1"
            >
              <span>{feature.linkText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
