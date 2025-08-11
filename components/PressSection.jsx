import Link from "next/link";

export default function PressSection() {
  const pressItems = [
    {
      date: "07/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. ",
      publication: "Forbes",
      logo: "/images/logo-forbes.png",
    },
    {
      date: "08/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. ",
      publication: "Sun",
      logo: "/images/logo-the-sun.png",
    },
    {
      date: "09/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. ",
      publication: "The New York Times",
      logo: "/images/logo-new-york-times.png",
    },
    {
      date: "10/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. ",
      publication: "Bloomberg",
      logo: "/images/logo-forbes.png",
    },
    {
      date: "11/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. ",
      publication: "WSJ",
      logo: "/images/logo-the-sun.png",
    },
    {
      date: "12/07/25",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Etiam mattis eu nulla accumsan iaculis. Phasellus vehicula eget diam in eleifend. ",
      publication: "Guardian",
      logo: "/images/logo-new-york-times.png",
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
