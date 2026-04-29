"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import PricingCard from "./pricing-card";

export default function PricingCarousel({ pricings = [] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  if (pricings.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#2a3b55] bg-[#0e1829] p-6 text-sm text-[#9fb1c7]">
        No pricing plans published yet.
      </div>
    );
  }

  if (pricings.length === 1) {
    return (
      <div className="mx-auto max-w-[28rem] px-1 sm:px-2">
        <PricingCard plan={pricings[0]} compact />
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
            className="mx-1 w-[88vw] max-w-[26rem] sm:mx-2 sm:w-[32rem] xl:w-[25rem]"
          >
            <PricingCard plan={plan} compact />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
