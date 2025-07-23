export default function SolutionBlocks() {
  const solutions = [
    {
      icon: "/icon-budget-png.png",
      title: "Precision in Budget Allocation",
      description:
        "Create accurate budget plans using real influencer data. Forecast outcomes and minimize waste.",
    },
    {
      icon: "/icon-selection-png.png",
      title: "Smarter Influencer Selection",
      description:
        "Select high-impact influencers using audience and performance insights.",
    },
    {
      icon: "/icon-optimisation-png.png",
      title: "Trend Driven Optimisation",
      description:
        "Adapt campaigns to trends and benchmarks for better engagement and ROI.",
    },
  ];

  return (
    <section className="px-6 py-16" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {solutions.map((solution, index) => (
          <div
            key={index}
            className="rounded-xl px-6 pt-6 pb-2 flex flex-col items-center text-center shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{
              maxWidth: "483px",
              backgroundColor: "#EFEFF7",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              minHeight: "300px",
            }}
          >
            {/* Icon */}
            <div className="mb-4 p-3 rounded-full border-2 border-blue-700 bg-white flex items-center justify-center">
              <img
                src={solution.icon}
                alt={solution.title}
                className="w-10 h-10"
              />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-[#2E3192] mb-2">
              {solution.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 leading-snug">{solution.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
