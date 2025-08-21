export default function CreatorPotentialSection() {
  return (
    <section className="w-full bg-[#EAEAF4] py-8 flex flex-col items-center font-[Poppins]">
      {/* Header */}
      <h2 className="text-[#2E3192] text-[40px] font-bold leading-[100%] text-center px-4 whitespace-nowrap mt-4">
        Unlock Your Full Potential as a Creator with Freetym
      </h2>

      {/* Description */}
      <p className="text-center text-[20px] font-normal leading-[100%] text-black max-w-[1321px] px-4 mt-4">
        Showcase your personal creator profile, powered by smart tools. Track
        your performance on Instagram and YouTube, land brand deals, discover
        what works in your niche, and turn your social media journey into a fun,
        rewarding experience — all with Freetym
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[426px_1fr] gap-6 mt-12 px-6 max-w-[1320px] w-full">
        {/* Box 1 */}
        <div
          className="rounded-[16px] px-8 pt-24 pb-6 flex flex-col"
          style={{
            background:
              "linear-gradient(96.73deg, #FFE3B3 2.18%, #FFC6A5 98.06%)",
            border: "3px solid #FFC7A5",
            boxShadow: "4px 4px 4px 0px #00000026",
          }}
        >
          <div className="text-left">
            <h3 className="text-[24px] font-semibold text-black mb-6 leading-[120%] whitespace-nowrap">
              Grow Your Personal Brand
            </h3>

            {/* Keep your manual line breaks, but add space between blocks */}
            <p className="text-[16px] text-black leading-[200%] font-normal">
              Boost your reach, engagement,
              <br />
              and followers on Instagram and
              <br />
              YouTube using our smart,
              <br />
              gamified growth system.
            </p>

            <p className="text-[16px] text-black leading-[150%] font-normal mt-4">
              Make your social media journey
              <br />
              fun, focused, and rewarding.
            </p>
          </div>

          <div className="flex-grow" />

          {/* CTA at bottom-right */}
          <div className="text-right">
            <a href="#" className="text-[16px] font-medium text-black">
              See more →
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Box 2 */}
          <div
            className="rounded-[16px] px-8 pt-8 pb-6 flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(96.73deg, #FFFFCB 2.18%, #FFE0B5 98.06%)",
              border: "3px solid #FFE0B5",
              boxShadow: "4px 4px 4px 0px #00000026",
            }}
          >
            <div className="text-left">
              <h3 className="text-[24px] font-semibold text-black mb-4">
                Earn While Growing Your Audience
              </h3>
              <p className="text-[16px] text-black">
                Collaborate with top brands, grow your audience on Instagram &
                <br />
                YouTube, and get paid for your content.
              </p>
            </div>
            <div className="text-right mt-4">
              <a href="#" className="text-[16px] font-medium text-black">
                See more →
              </a>
            </div>
          </div>

          {/* Box 3 & Box 4 in a row */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Box 3 */}
            <div
              className="rounded-[16px] px-8 pt-8 pb-6 flex flex-col justify-between w-full sm:w-1/2"
              style={{
                background:
                  "linear-gradient(96.73deg, #D8F1FF 2.18%, #FFF5D2 98.06%)",
                border: "3px solid #DCF2FB",
                boxShadow: "4px 4px 4px 0px #00000026",
              }}
            >
              <div className="text-left">
                <h3 className="text-[24px] font-semibold text-black mb-4">
                  Showcase Your Creator Spotlight
                </h3>
                <p className="text-[16px] text-black">
                  Use Freetym's AI tools to <br />
                  highlight your journey and <br />
                  attract brand deals that match <br />
                  your style.
                </p>
              </div>
              <div className="text-right mt-4">
                <a href="#" className="text-[16px] font-medium text-black">
                  See more →
                </a>
              </div>
            </div>

            {/* Box 4 */}
            <div
              className="rounded-[16px] px-8 pt-8 pb-6 flex flex-col justify-between w-full sm:w-1/2"
              style={{
                background:
                  "linear-gradient(96.73deg, #FDDDE6 2.18%, #FFE0CC 98.06%)",
                border: "3px solid #FDDDE3",
                boxShadow: "4px 4px 4px 0px #00000026",
              }}
            >
              <div className="text-left">
                <h3 className="text-[24px] font-semibold text-black mb-4">
                  Master Your Niche with Smart Insights
                </h3>
                <p className="text-[16px] text-black">
                  Freetym's rankings and AI <br />
                  analytics help you spot trends <br /> and grow faster with
                  content <br />
                  that works.
                </p>
              </div>
              <div className="text-right mt-4">
                <a href="#" className="text-[16px] font-medium text-black">
                  See more →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Box 5 – Full Width Below All */}
      <div className="px-6 max-w-[1320px] w-full mt-4">
        <div
          className="rounded-[16px] px-8 pt-8 pb-6 flex flex-col h-full"
          style={{
            background:
              "linear-gradient(96.73deg, #E8F8B7 2.18%, #C6F7E2 98.06%)",
            border: "3px solid #C6F7E2",
            boxShadow: "4px 4px 4px 0px #00000026",
          }}
        >
          <div className="text-left space-y-4">
            <h3 className="text-[24px] font-semibold text-black">
              Track Your Social Media Performance
            </h3>
            <p className="text-[16px] text-black leading-[150%]">
              Monitor your growth, engagement, and reach on Instagram and
              YouTube, all in one place.
              <br />
              Get clear, AI-powered analytics and reports to understand what’s
              working and how to grow faster.
            </p>
          </div>

          {/* Push CTA to bottom-right */}
          <div className="flex-grow" />
          <div className="text-right mt-4">
            <a href="#" className="text-[16px] font-medium text-black">
              See more →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
