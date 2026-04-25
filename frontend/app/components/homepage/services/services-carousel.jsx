"use client";

import { useEffect, useState } from "react";
import ServiceCard from "./service-card";

function getCardsPerView(width) {
  if (width >= 1280) {
    return 3;
  }

  if (width >= 768) {
    return 2;
  }

  return 1;
}

export default function ServicesCarousel({ services = [] }) {
  const featured = services.filter((service) => service.isFeatured);
  const others = services.filter((service) => !service.isFeatured);
  const orderedServices = [...featured, ...others];
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

  const maxPage = Math.max(0, orderedServices.length - cardsPerView);
  const activePage = Math.min(page, maxPage);

  useEffect(() => {
    if (orderedServices.length <= cardsPerView) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setPage((currentPage) => (currentPage >= maxPage ? 0 : currentPage + 1));
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [cardsPerView, maxPage, orderedServices.length]);

  if (orderedServices.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#2a3b55] bg-[#0e1829] p-6 text-sm text-[#9fb1c7]">
        No services published yet.
      </div>
    );
  }

  const showControls = orderedServices.length > cardsPerView;

  return (
    <div>
      {showControls ? (
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setPage(activePage <= 0 ? maxPage : activePage - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#314762] bg-[#0d1728] text-lg text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            aria-label="Previous services"
          >
            {"<"}
          </button>
          <div className="order-3 w-full text-center text-[11px] uppercase tracking-[0.24em] text-[#8ea5bd] sm:order-none sm:w-auto sm:text-xs sm:tracking-[0.28em]">
            Featured first
          </div>
          <button
            type="button"
            onClick={() => setPage(activePage >= maxPage ? 0 : activePage + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#314762] bg-[#0d1728] text-lg text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
            aria-label="Next services"
          >
            {">"}
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden -mx-1 sm:mx-0">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activePage * (100 / cardsPerView)}%)` }}
        >
          {orderedServices.map((service) => (
            <div
              key={service.id}
              className="w-full shrink-0 px-1 sm:px-2"
              style={{ flexBasis: `${100 / cardsPerView}%` }}
            >
              <div className="h-full">
                <ServiceCard service={service} compact />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
