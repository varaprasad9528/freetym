"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallToActionSection from "@/components/CallToActionSection";

export default function NewsPage() {
  const base = [
    {
      date: "07/07/25",
      text: "Freetym launches a powerful influencer marketing platform connecting brands and creators for campaign management, analytics, and seamless collaboration. Drive authentic engagement and maximize ROI with Freetym’s intuitive tools and real-time dashboards.",
      publication: "Forbes",
      logo: "/images/logo-forbes.png",
    },
    {
      date: "08/07/25",
      text:"Freetym debuts as the go-to influencer marketing hub, empowering creators and brands to manage campaigns, collaborate directly, and access actionable analytics. Grow your impact and reach—join Freetym today!",
      publication: "Sun",
      logo: "/images/logo-the-sun.png",
    },
    {
      date: "09/07/25",
      text:"Freetym introduces a next-generation influencer platform, revolutionizing collaboration and campaign management. Brands and creators enjoy streamlined partnerships, impactful analytics, and automated reporting. Enter a new era of influencer marketing with Freetym.",
      publication: "The New York Times",
      logo: "/images/logo-new-york-times.png",
    },
    {
      date: "07/07/25",
      text: "Freetym transforms influencer marketing for brands and creators. The platform offers effortless campaign creation, partnership management, and powerful analytics to optimize results and build authentic, measurable marketing success.",
      publication: "Forbes",
      logo: "/images/logo-forbes.png",
    },
    {
      date: "07/07/25",
      text: "Freetym, an all-inclusive influencer platform, connects businesses and talent for seamless collaboration, content planning, campaign tracking, and detailed reporting—empowering users to enhance their digital marketing reach.",
      publication: "Forbes",
      logo: "/images/logo-new-york-times.png",
    },
    {
      date: "07/07/25",
      text: "Freetym helps businesses discover and collaborate with top influencers. Enjoy easy campaign creation, direct messaging, and robust analytics in one effortless, all-in-one platform designed for influencer marketing",
      publication: "Forbes",
      logo: "/images/logo-forbes.png",
    },
    {
      date: "07/07/25",
      text: "Freetym fosters dynamic influencer-brand partnerships. Simplify campaign setup, monitor performance, and gain insights for stronger marketing results. Join Freetym’s digital hub for effective, high-impact influencer marketing strategies.",
      publication: "Forbes",
      logo: "/images/logo-the-sun.png",
    },
    {
      date: "07/07/25",
      text: "Freetym is your influencer marketplace for effortless registration, campaign management, and analytics. Brands and creators streamline collaborations for growth, engagement, and measurable marketing success on one unified platform.",
      publication: "Forbes",
      logo: "/images/logo-new-york-times.png",
    },
    {
      date: "07/07/25",
      text:"Freetym offers innovative influencer marketing tools for campaign management, brand partnerships, and detailed analytics, helping brands and creators achieve maximum growth and impactful results together.",
      publication: "Forbes",
      logo: "/images/logo-forbes.png",
    },{
      date: "07/07/25",
      text:"Freetym brings brands and creators together with tools for seamless influencer discovery, campaign management, and engagement metrics—all accessible through an easy, user-focused dashboard. Unlock your marketing potential with Freetym.",
      publication: "Forbes",
      logo: "/images/logo-the-sun.png",
    },
    {
      date: "07/07/25",
      text: "Freetym is your influencer marketplace for effortless registration, campaign management, and analytics. Brands and creators streamline collaborations for growth, engagement, and measurable marketing success on one unified platform.",
      publication: "Forbes",
      logo: "/images/logo-new-york-times.png",
    },
    {
      date: "07/07/25",
      text: "Freetym fosters dynamic influencer-brand partnerships. Simplify campaign setup, monitor performance, and gain insights for stronger marketing results. Join Freetym’s digital hub for effective, high-impact influencer marketing strategies.",
      publication: "Forbes",
      logo: "/images/logo-the-sun.png",
    },
  ];

  const pressItems = Array.from(
    { length: 12 },
    (_, i) => base[i % base.length]
  );

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FFF8F0" }}>
      <Header />

      <section className="px-6 pt-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-center mb-10"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#2E3192",
            }}
          >
            Latest news
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressItems.map((item, idx) => (
              <article
                key={`${item.publication}-${idx}`}
                className="bg-white rounded-xl p-8 text-left shadow-md hover:shadow-lg transition duration-300 flex flex-col justify-between h-[350px] max-w-[483px] w-full mx-auto"
                style={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.06)" }}
              >
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-4">
                    {item.date}
                  </h2>
                  <p className="text-gray-800 text-base leading-relaxed">
                    {item.text}
                  </p>
                </div>
                <img
                  src={item.logo}
                  alt={item.publication}
                  className="h-8 w-auto object-contain mt-6"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <CallToActionSection />

      <Footer />
    </main>
  );
}
