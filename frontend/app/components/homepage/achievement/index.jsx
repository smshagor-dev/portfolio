"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import SectionHeading from "../section-heading";

function AchievementCard({ item, index, onSelect, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      data-achievement-card="true"
      className={`group relative overflow-hidden rounded-[1.75rem] border border-[#2b3f58] bg-[linear-gradient(180deg,rgba(17,27,44,0.98),rgba(9,15,26,0.98))] p-5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#6bcff9] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,210,117,0.95),rgba(108,207,249,0.85),transparent)]" />
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#35506f] bg-[#102038] sm:h-20 sm:w-20">
          {item?.image ? (
            <Image src={item.image} alt={item.title || "Achievement image"} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.25em] text-[#8cddff]">
              {item?.type || "Award"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full border border-[#445b76] bg-[#121c2e] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#f4d08a]">
            {item?.type || "Achievement"}
          </span>
          <h3 className="mt-3 text-base font-semibold text-white sm:mt-4 sm:text-lg">{item?.title}</h3>
          <p className="mt-2 text-sm text-[#9fc1de]">{item?.issuer}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[#7dd9ff]">{item?.date}</p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#84ddff]">
        <span>View Details</span>
        <ExternalLink size={14} />
      </div>
    </button>
  );
}

export default function AchievementSection({ achievements = [] }) {
  const items = Array.isArray(achievements) ? achievements.filter(Boolean) : [];
  const [activeIndex, setActiveIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const trackRef = useRef(null);
  const loopResetTimeoutRef = useRef(null);
  const renderedItems = items.length > 1 ? [...items, ...items] : items;

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length < 2 || isModalOpen) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const firstCard = track.querySelector("[data-achievement-card]");
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : track.clientWidth;
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "16") || 16;
      const step = cardWidth + gap;
      const singleLoopWidth = track.scrollWidth / 2;
      const nextLeft = track.scrollLeft + step;

      if (loopResetTimeoutRef.current) {
        window.clearTimeout(loopResetTimeoutRef.current);
      }

      track.scrollTo({ left: nextLeft, behavior: "smooth" });

      if (nextLeft >= singleLoopWidth - 4) {
        loopResetTimeoutRef.current = window.setTimeout(() => {
          track.scrollTo({
            left: nextLeft - singleLoopWidth,
            behavior: "auto",
          });
        }, 450);
      }
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
      if (loopResetTimeoutRef.current) {
        window.clearTimeout(loopResetTimeoutRef.current);
      }
    };
  }, [isModalOpen, items.length]);

  if (!items.length) {
    return null;
  }

  function handleSelect(index) {
    setActiveIndex(index % items.length);
    setIsModalOpen(true);
  }

  return (
    <section id="achievement" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(255,202,102,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 md:p-8">
        <SectionHeading
          label="Achievement"
          title="Awards, certificates, and milestones from real work"
          description="Tap or click any card to open the image in a larger popup."
        />

        <div
          ref={trackRef}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {renderedItems.map((item, index) => (
            <AchievementCard
              key={`${item?.title || "achievement"}-${index}`}
              item={item}
              index={index}
              onSelect={handleSelect}
              className="w-full min-w-full snap-center md:min-w-[calc(50%-0.5rem)] xl:min-w-[calc(33.333%-0.75rem)]"
            />
          ))}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(3,7,14,0.82)] px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[1.8rem] border border-[#35506f] bg-[linear-gradient(180deg,#10192b,#09111d)] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3a5678] bg-[rgba(9,17,29,0.82)] text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
              aria-label="Close achievement image popup"
            >
              <X size={18} />
            </button>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_320px]">
              <div className="relative min-h-[300px] bg-[#08111e]">
                {activeItem?.image ? (
                  <Image
                    src={activeItem.image}
                    alt={activeItem.title || "Achievement image"}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm uppercase tracking-[0.3em] text-[#8fdcff]">
                    {activeItem?.type || "Achievement"}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center p-6">
                <span className="inline-flex self-start rounded-full border border-[#445b76] bg-[#121c2e] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#f4d08a]">
                  {activeItem?.type || "Achievement"}
                </span>
                <h3 className="mt-4 text-2xl font-semibold text-white">{activeItem?.title || "Achievement"}</h3>
                <p className="mt-3 text-sm leading-7 text-[#b9cade]">{activeItem?.issuer || "Not specified"}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#7dd9ff]">{activeItem?.date || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
