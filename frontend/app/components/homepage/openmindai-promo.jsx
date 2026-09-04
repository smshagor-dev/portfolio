"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PROMO_URL = "https://openmindai.org";
const DISMISS_KEY = "openmindai_promo_dismissed";
const POPUP_DELAY_MS = 5000;
const CTA_LABEL = "Explore my Open Mind AI";

export default function OpenMindAIPromo() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let timer;

    try {
      if (sessionStorage.getItem(DISMISS_KEY) !== "1") {
        timer = window.setTimeout(() => setShowPopup(true), POPUP_DELAY_MS);
      }
    } catch {
      timer = window.setTimeout(() => setShowPopup(true), POPUP_DELAY_MS);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!showPopup) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closePopup();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showPopup]);

  function closePopup() {
    setShowPopup(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Keep dismissal functional even when sessionStorage is unavailable.
    }
  }

  return (
    <>
      <section className="my-12 lg:my-20" aria-label="OpenMindAI promotion">
        <div className="overflow-hidden rounded-[2rem] border border-[#2b455f] bg-[linear-gradient(180deg,#0d1828,#08111d)] shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
          <a
            href={PROMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            aria-label="Visit OpenMindAI website"
          >
            <div className="relative overflow-hidden">
              <Image
                src="/openmindai-promo.svg"
                alt="OpenMindAI local, private and offline-first AI for desktop and mobile"
                width={1600}
                height={560}
                sizes="100vw"
                className="h-auto w-full transition duration-500 group-hover:scale-[1.01]"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-4 border-t border-[#20354c] bg-[#0b1624] px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">OpenMindAI — local AI built around privacy and offline use.</p>
                <p className="mt-1 text-xs leading-6 text-[#8ea7be]">Explore desktop and mobile experiences, local models, chat, coding and document workflows.</p>
              </div>
              <span className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-center text-sm font-semibold text-[#06101b] transition group-hover:opacity-90 sm:w-auto sm:px-6">
                <span>{CTA_LABEL}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.9" aria-hidden="true">
                  <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </section>

      {showPopup ? (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-[#020712]/80 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="OpenMindAI promotion"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePopup();
            }
          }}
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#34536f] bg-[#08121f] shadow-[0_34px_110px_rgba(0,0,0,0.58)]">
            <button
              type="button"
              onClick={closePopup}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#06101a]/85 text-lg text-white backdrop-blur transition hover:border-[#76d7ff] hover:text-[#8be0ff]"
              aria-label="Close OpenMindAI promotion"
            >
              ×
            </button>

            <a href={PROMO_URL} target="_blank" rel="noopener noreferrer" className="group block">
              <Image
                src="/openmindai-promo.svg"
                alt="OpenMindAI promotional banner"
                width={1600}
                height={560}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="h-auto w-full transition duration-500 group-hover:scale-[1.01]"
                unoptimized
                priority
              />
            </a>

            <div className="flex flex-col gap-4 border-t border-[#20384f] bg-[linear-gradient(180deg,#0d1928,#09131f)] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
              <div className="min-w-0 pr-0 sm:pr-3">
                <p className="text-lg font-semibold text-white">Discover OpenMindAI</p>
                <p className="mt-1 text-sm leading-6 text-[#9bb0c4]">Run AI locally with a privacy-first, offline-ready experience for desktop and mobile.</p>
              </div>
              <a
                href={PROMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#6cc8ff,#7cf0b7)] px-5 py-3 text-center text-sm font-semibold text-[#06101b] transition hover:opacity-90 sm:w-auto sm:px-6"
              >
                <span>{CTA_LABEL}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.9" aria-hidden="true">
                  <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
