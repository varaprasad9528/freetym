"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TestimonialSlider() {
  const testimonials = [
    {
      logo: "/images/logo-marriott.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat.",
      clientName: "Priya Desai",
      position: "Marketing Lead, GlowEssence",
    },
    {
      logo: "/images/logo-marriott.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. ",
      clientName: "Rohan Mehta",
      position: "CMO, FitFuel",
    },
    {
      logo: "/images/logo-marriott.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. ",
      clientName: "Sneha Kapoor",
      position: "Growth Manager, StyleNest",
    },
    {
      logo: "/images/logo-marriott.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. .",
      clientName: "Amit Verma",
      position: "Founder, TasteBudBox",
    },
    {
      logo: "/images/logo-marriott.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan magna id pellentesque volutpat. ",
      clientName: "Nisha Rao",
      position: "Performance Head, UrbanTrendz",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const nextSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + itemsPerPage) % testimonials.length
    );
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - itemsPerPage + testimonials.length) % testimonials.length
    );
  };

  const getVisibleItems = () => {
    const visible = [];
    for (let i = 0; i < itemsPerPage; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  return (
    <section className="px-4 py-24 bg-[#FFF8F0] overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto relative flex items-center justify-center overflow-visible">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-0 z-10 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Testimonial Cards */}
        <div className="flex justify-center w-full gap-8 overflow-visible">
          {getVisibleItems().map((item, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 flex flex-col bg-[#EFEFF7] hover:bg-[#2E3192] hover:text-white transition duration-300 rounded-2xl pt-20 pb-6 px-6 w-full max-w-[400px] shadow-md min-h-[440px] group"
            >
              {/* Floating Logo */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center shadow-md z-10">
                <img
                  src={item.logo}
                  alt="Client Logo"
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>

              {/* Text content */}
              <div className="flex flex-col flex-grow justify-between mt-6">
                <p className="text-[15px] leading-[26px] px-2 group-hover:text-white transition-colors">
                  {item.text}
                </p>
              </div>

              {/* Client Info fixed to bottom */}
              <div className="mt-auto bg-white group-hover:bg-white w-[90%] mx-auto rounded-xl py-3 px-4 shadow transition-colors">
                <p className="text-gray-800 font-medium text-[16px] mb-1">
                  {item.clientName}
                </p>
                <p className="text-gray-500 text-[14px]">{item.position}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-0 z-10 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </section>
  );
}
