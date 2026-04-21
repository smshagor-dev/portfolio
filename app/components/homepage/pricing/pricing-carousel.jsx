"use client";

import { useEffect, useState } from "react";
import PricingCard from "./pricing-card";

function getCardsPerView(width) {
  if (width >= 1280) {
    return 3;
  }

  if (width >= 768) {
    return 2;
  }

  return 1;
}

export default function PricingCarousel({ pricings = [] }) {
  const [cardsPerView, setCardsPerView] = useState(1);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const updateCardsPerView = () => {
      setCardsPerView(getCardsPerView(window.innerWidth));
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxPage = Math.max(0, pricings.length - cardsPerView);
  const activePage = Math.min(page, maxPage);

  useEffect(() => {
    if (pricings.length <= cardsPerView) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setPage((currentPage) => (currentPage >= maxPage ? 0 : currentPage + 1));
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [cardsPerView, maxPage, pricings.length]);

  if (pricings.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#2a3b55] bg-[#0e1829] p-6 text-sm text-[#9fb1c7]">
        No pricing plans published yet.
      </div>
    );
  }

  const showControls = pricings.length > cardsPerView;

  return (
    <div>
      {showControls ? (
        <div className="mb-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage(activePage <= 0 ? maxPage : activePage - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#314762] bg-[#0d1728] text-lg text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            aria-label="Previous pricing plans"
          >
            {"<"}
          </button>
          <div className="text-xs uppercase tracking-[0.28em] text-[#8ea5bd]">
            Scroll plans
          </div>
          <button
            type="button"
            onClick={() => setPage(activePage >= maxPage ? 0 : activePage + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#314762] bg-[#0d1728] text-lg text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            aria-label="Next pricing plans"
          >
            {">"}
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activePage * (100 / cardsPerView)}%)` }}
        >
          {pricings.map((plan) => (
            <div
              key={plan.id}
              className="w-full shrink-0 px-2"
              style={{ flexBasis: `${100 / cardsPerView}%` }}
            >
              <PricingCard plan={plan} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
