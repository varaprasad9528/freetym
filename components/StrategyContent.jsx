"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function StrategyContent() {
  const accordionItems = [
    {
      value: "item-1",
      title: "Build Authentic Trust",
      content:
        "Freetym helps brands build genuine connections with their audience through authentic influencer partnerships. Our platform ensures transparency and relevance, fostering trust that translates into lasting customer loyalty.",
    },
    {
      value: "item-2",
      title: "Attract, Engage & Convert",
      content:
        "Leverage Freetym's tools to attract new customers, engage them with compelling content, and drive conversions. Our data-driven approach optimizes campaigns for maximum impact across all stages of the marketing funnel.",
    },
    {
      value: "item-3",
      title: "Influence Purchase Decisions",
      content:
        "With Freetym, brands can effectively influence consumer purchase decisions. By connecting with the right influencers, you can create powerful campaigns that resonate with target audiences and drive sales.",
    },
  ];

  return (
    <section className="px-6 pt-24 pb-0" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16">
        {/* Accordion Section */}
        <div className="w-full lg:w-[480px] flex flex-col gap-6 justify-center min-h-[500px]">
          <Accordion
            type="single"
            collapsible
            className="w-full flex flex-col gap-6"
          >
            {accordionItems.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="rounded-lg overflow-hidden"
              >
                <AccordionTrigger
                  className="group flex justify-between items-center w-full px-6 py-4 text-lg font-semibold shadow-md transition-all
                  bg-[#ECECFF] text-black
                  hover:bg-[#e0e0f8]
                  data-[state=open]:bg-[#F79966] data-[state=open]:text-black
                  no-underline hover:no-underline focus:outline-none"
                  style={{ textDecoration: "none" }}
                >
                  <span className="no-underline group-hover:no-underline">
                    {item.title}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="px-6 py-4 text-gray-700 bg-transparent">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Image Section */}
        <div
          className="flex-shrink-0 hidden lg:block"
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          <img
            src="/mobile.svg"
            alt="Mobile phones displaying influencer content"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
