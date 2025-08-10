"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallToActionSection from "@/components/CallToActionSection";

export default function NewsPage() {
  const base = [
    {
      date: "07/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      publication: "Forbes",
      logo: "/images/logo-forbes.png",
    },
    {
      date: "08/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      publication: "Sun",
      logo: "/images/logo-the-sun.png",
    },
    {
      date: "09/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      publication: "The New York Times",
      logo: "/images/logo-new-york-times.png",
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
