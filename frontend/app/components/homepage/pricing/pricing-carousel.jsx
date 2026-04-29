"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import PricingCard from "./pricing-card";

export default function PricingCarousel({ pricings = [] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobile || pricings.length <= 1) {
      setActiveIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % pricings.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isMobile, pricings.length]);

  if (pricings.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#2a3b55] bg-[#0e1829] p-6 text-sm text-[#9fb1c7]">
        No pricing plans published yet.
      </div>
    );
  }

  if (pricings.length === 1) {
    return (
      <div className="mx-auto w-full max-w-[28rem] px-0 sm:px-2">
        <PricingCard plan={pricings[0]} compact />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="relative">
        <div className="mb-5 text-center text-[11px] uppercase tracking-[0.24em] text-[#8ea5bd]">
          Auto scrolling plans
        </div>

        <div className="overflow-hidden py-2">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {pricings.map((plan, index) => (
              <div
                key={plan.id || plan.slug || `${plan.name}-${index}`}
                className="w-full min-w-full px-1"
              >
                <PricingCard plan={plan} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#101828] to-transparent sm:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#09111d] to-transparent sm:w-14" />

      <div className="mb-5 text-center text-[11px] uppercase tracking-[0.24em] text-[#8ea5bd] sm:text-xs sm:tracking-[0.28em]">
        Auto scrolling plans
      </div>

      <Marquee
        gradient={false}
        speed={isMobile ? 26 : 38}
        pauseOnHover
        pauseOnClick
        direction="left"
        className="overflow-y-hidden py-2"
      >
        {pricings.map((plan, index) => (
          <div
            key={plan.id || plan.slug || `${plan.name}-${index}`}
            className="mx-1 flex w-[88vw] max-w-[26rem] sm:mx-2 sm:w-[32rem] xl:w-[25rem]"
          >
            <PricingCard plan={plan} compact />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
