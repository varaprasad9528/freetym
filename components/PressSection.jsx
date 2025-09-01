import Link from "next/link";

export default function PressSection() {
  const pressItems = [
    {
      date: "07/07/25",
      text: "Freetym launches a powerful influencer marketing platform connecting brands and creators for campaign management, analytics, and seamless collaboration. Drive authentic engagement and maximize ROI with Freetym’s intuitive tools and real-time dashboards. ",
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
  ];

  return (
    <section
      className="px-6 py-16 text-center flex flex-col items-center justify-center"
      style={{ backgroundColor: "#2E3192" }}
    >
      <h2 className="text-white text-5xl font-bold mb-16 font-poppins">
        Freetym in the press
      </h2>

      {/* Press Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-[1513px] w-full">
        {pressItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-8 text-left shadow-md hover:shadow-lg transition duration-300 flex flex-col justify-between"
            style={{
              maxWidth: "483px",
              height: "100%",
            }}
          >
            <div>
              <h2 className="text-gray-800 text-xl font-bold mb-4">
                {item.date}
              </h2>
              <p className="text-gray-800 text-base mb-6">{item.text}</p>
            </div>
            <img
              src={item.logo}
              alt={item.publication}
              className="h-8 w-auto object-contain mt-auto"
            />
          </div>
        ))}
      </div>

      {/* More link → /news */}
      <Link
        href="/news"
        className="text-white hover:underline text-lg font-medium flex items-center space-x-2"
      >
        <span>More about press</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </section>
  );
}
